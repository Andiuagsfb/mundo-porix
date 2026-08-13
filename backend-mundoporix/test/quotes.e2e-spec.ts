process.env.DATABASE_URL =
  'postgresql://mundoporix:mundoporix_dev@localhost:5432/mundoporix_test?schema=public';
process.env.NODE_ENV = 'test';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReservationsService } from '../src/reservations/reservations.service';

describe('Flujo cotizaciones (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let adminToken: string;
  let categoryId: string;
  let brandId: string;

  const createdProducts: string[] = [];
  const createdQuotes: string[] = [];

  const futurePickup = () =>
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const api = (path: string) => `/api/v1${path}`;

  async function createProduct(
    name: string,
    price: number,
    initialStock: number,
  ) {
    const res = await request(server)
      .post(api('/admin/products'))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name,
        price,
        brandId,
        categoryId,
        initialStock,
      })
      .expect(201);
    createdProducts.push(res.body.id);
    return res.body as { id: string; price: string };
  }

  async function createQuote(
    productId: string,
    quantity: number,
    token?: string,
  ) {
    const req = request(server)
      .post(api('/quotes'))
      .send({
        customerName: 'Cliente E2E',
        customerPhone: '3009998877',
        pickupDate: futurePickup(),
        items: [{ productId, quantity }],
      });
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    const res = await req;
    if (res.status === 201) {
      createdQuotes.push(res.body.id);
    }
    return res;
  }

  async function getInventory(productId: string) {
    const res = await request(server)
      .get(api(`/admin/inventory/${productId}`))
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    return res.body as {
      quantity: number;
      reservedQuantity: number;
      availableQuantity: number;
    };
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
    prisma = app.get(PrismaService);

    const login = await request(server)
      .post(api('/auth/login'))
      .send({ email: 'admin@mundoporix.com', password: 'Admin123!' })
      .expect(200);
    adminToken = login.body.accessToken;

    const categories = await request(server)
      .get(api('/categories'))
      .expect(200);
    const brands = await request(server).get(api('/brands')).expect(200);
    categoryId = categories.body[0].id;
    brandId = brands.body[0].id;
  });

  afterAll(async () => {
    if (createdQuotes.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { quoteId: { in: createdQuotes } },
      });
      await prisma.quote.deleteMany({
        where: { id: { in: createdQuotes } },
      });
    }
    if (createdProducts.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: createdProducts } },
      });
    }
    await app.close();
  });

  it('crea una cotización: reserva stock y congela el precio oficial', async () => {
    const product = await createProduct('Cuaderno E2E', 5000, 10);

    const res = await createQuote(product.id, 3);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('RESERVED');
    expect(res.body.quoteNumber).toMatch(/^COT-\d{4}-\d{6}$/);
    expect(res.body.total).toBe('15000');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].unitPrice).toBe('5000');
    expect(res.body.items[0].subtotal).toBe('15000');

    const inv = await getInventory(product.id);
    expect(inv.quantity).toBe(10);
    expect(inv.reservedQuantity).toBe(3);
    expect(inv.availableQuantity).toBe(7);
  });

  it('rechaza el precio enviado por el cliente (no confiable)', async () => {
    const product = await createProduct('Precio Manipulado E2E', 10000, 5);

    const res = await request(server)
      .post(api('/quotes'))
      .send({
        customerName: 'Cliente E2E',
        customerPhone: '3001112233',
        pickupDate: futurePickup(),
        items: [{ productId: product.id, quantity: 2, unitPrice: 1 }],
      })
      .expect(400);

    expect(res.body.message).toBeTruthy();
  });

  it('rechaza solicitudes con stock insuficiente (stock 5, solicitud 6)', async () => {
    const product = await createProduct('Stock Bajo E2E', 3000, 5);

    const res = await createQuote(product.id, 6);
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('Stock insuficiente');
  });

  it('resuelve concurrencia: con 1 unidad y 2 solicitudes simultáneas, solo una gana', async () => {
    const product = await createProduct('Concurrencia E2E', 2000, 1);

    const payload = {
      customerName: 'Cliente E2E',
      customerPhone: '3007776655',
      pickupDate: futurePickup(),
      items: [{ productId: product.id, quantity: 1 }],
    };

    const results = await Promise.allSettled([
      request(server).post(api('/quotes')).send(payload),
      request(server).post(api('/quotes')).send(payload),
    ]);

    const statuses = results.map((r) =>
      r.status === 'fulfilled' ? r.value.status : 'rejected',
    );

    const created = statuses.filter((s) => s === 201).length;
    const rejected = statuses.filter((s) => s === 409).length;
    expect(created).toBe(1);
    expect(rejected).toBe(1);

    const winner = results.find(
      (r) => r.status === 'fulfilled' && r.value.status === 201,
    );
    if (winner?.status === 'fulfilled') {
      createdQuotes.push(winner.value.body.id);
    }

    const inv = await getInventory(product.id);
    expect(inv.availableQuantity).toBe(0);
  });

  it('conserva el precio histórico al cambiar el precio del producto', async () => {
    const product = await createProduct('Historico E2E', 5000, 20);

    const first = await createQuote(product.id, 2);
    expect(first.status).toBe(201);
    expect(first.body.total).toBe('10000');

    await request(server)
      .patch(api(`/admin/products/${product.id}`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 8000 })
      .expect(200);

    const second = await createQuote(product.id, 2);
    expect(second.status).toBe(201);
    expect(second.body.total).toBe('16000');

    const byNumber = await request(server)
      .get(api(`/quotes/${first.body.quoteNumber}`))
      .expect(200);
    expect(byNumber.body.total).toBe('10000');
    expect(byNumber.body.items[0].unitPrice).toBe('5000');
  });

  it('valida la máquina de estados: rechaza transiciones inválidas', async () => {
    const product = await createProduct('Estados E2E', 1000, 5);
    const quote = await createQuote(product.id, 1);
    expect(quote.status).toBe(201);

    const id = quote.body.id;

    await request(server)
      .patch(api(`/admin/quotes/${id}/status`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PICKED_UP' })
      .expect(400);

    await request(server)
      .patch(api(`/admin/quotes/${id}/status`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARING' })
      .expect(200);

    await request(server)
      .patch(api(`/admin/quotes/${id}/status`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'READY_FOR_PICKUP' })
      .expect(200);

    await request(server)
      .patch(api(`/admin/quotes/${id}/status`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PICKED_UP' })
      .expect(200);

    await request(server)
      .patch(api(`/admin/quotes/${id}/status`))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'NEW' })
      .expect(400);
  });

  it('cancelación libera el stock reservado', async () => {
    const product = await createProduct('Cancelacion E2E', 4000, 5);
    const quote = await createQuote(product.id, 2);
    expect(quote.status).toBe(201);

    let inv = await getInventory(product.id);
    expect(inv.availableQuantity).toBe(3);

    const cancelled = await request(server)
      .post(api(`/admin/quotes/${quote.body.id}/cancel`))
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect(cancelled.body.status).toBe('CANCELLED');

    inv = await getInventory(product.id);
    expect(inv.reservedQuantity).toBe(0);
    expect(inv.availableQuantity).toBe(5);
  });

  it('la expiración de reservas libera stock y mueve la cotización a EXPIRED', async () => {
    const product = await createProduct('Expiracion E2E', 2500, 5);
    const quote = await createQuote(product.id, 2);
    expect(quote.status).toBe(201);
    const quoteId = quote.body.id;

    let inv = await getInventory(product.id);
    expect(inv.availableQuantity).toBe(3);

    await prisma.reservation.update({
      where: { quoteId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await app.get(ReservationsService).expireReservations();

    const updated = await request(server)
      .get(api(`/admin/quotes/${quoteId}`))
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(updated.body.status).toBe('EXPIRED');
    expect(updated.body.reservation.status).toBe('EXPIRED');

    inv = await getInventory(product.id);
    expect(inv.reservedQuantity).toBe(0);
    expect(inv.availableQuantity).toBe(5);
  });
});
