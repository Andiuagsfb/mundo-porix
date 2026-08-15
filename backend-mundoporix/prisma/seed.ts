import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });
  await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER' },
  });
  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT' },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@mundoporix.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'Administrador',
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const clientEmail = process.env.SEED_CLIENT_EMAIL ?? 'cliente@mundoporix.com';
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? 'Cliente123!';
  const clientPasswordHash = await bcrypt.hash(clientPassword, 10);

  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      fullName: 'Cliente Demo',
      phone: '+57 300 123 4567',
      passwordHash: clientPasswordHash,
      roleId: clientRole.id,
    },
  });

  const categories = [
    'Papelería',
    'Tecnología',
    'Oficina',
    'Arte y Manualidades',
    'Regalos',
  ];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const brands = [
    'Faber-Castell',
    'BIC',
    'Paper Mate',
    'Maped',
    'Kores',
    'PILOT',
    'Stabilo',
    'Pelikan',
    'Artesco',
    'Luxor',
    'Logitech',
    'Genius',
    'Post-it',
  ];
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const category = (name: string) =>
    prisma.category.findUniqueOrThrow({ where: { name } });
  const brand = (name: string) =>
    prisma.brand.findUniqueOrThrow({ where: { name } });

  const products = [
    {
      name: 'Cuaderno Universitario 100 hojas',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 4800,
      stock: 60,
      description: 'Cuaderno tamaño carta, 100 hojas cuadriculadas y espiral.',
    },
    {
      name: 'Bolígrafo BIC Cristal',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('BIC')).id,
      price: 1200,
      stock: 120,
      description: 'Bolígrafo clásico de tinta azul, punta fina 0.8mm.',
    },
    {
      name: 'Esfero Paper Mate InkJoy',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Paper Mate')).id,
      price: 3800,
      stock: 80,
      description: 'Escritura suave y sin manchas, tinta negra 0.7mm.',
    },
    {
      name: 'Set 12 marcadores Faber-Castell',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Faber-Castell')).id,
      price: 28500,
      stock: 25,
      description: 'Set de 12 marcadores de colores intensos y tinta a base de agua.',
    },
    {
      name: 'Lápices de colores Faber-Castell (24)',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Faber-Castell')).id,
      price: 39800,
      stock: 18,
      description: 'Caja de 24 lápices de colores, mina resistente.',
    },
    {
      name: 'Tijeras Maped Sencut',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Maped')).id,
      price: 6900,
      stock: 40,
      description: 'Tijeras de oficina con hoja de acero inoxidable.',
    },
    {
      name: 'Regla 30 cm Maped',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Maped')).id,
      price: 2900,
      stock: 55,
      description: 'Regla de plástico transparente con doble escala.',
    },
    {
      name: 'Cinta adhesiva Kores 24mm',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Kores')).id,
      price: 3400,
      stock: 70,
      description: 'Cinta adhesiva transparente de 24mm x 30m.',
    },
    {
      name: 'Cuaderno argollado profesional 120 hojas',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Maped')).id,
      price: 7800,
      stock: 45,
      description: 'Cuaderno con argollas metálicas, 120 hojas y tapa dura.',
    },
    {
      name: 'Block cuadriculado A5 80 hojas',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 5200,
      stock: 60,
      description: 'Block de 80 hojas cuadriculadas tamaño A5, ideal para apuntes.',
    },
    {
      name: 'Resaltador Stabilo Boss x4',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Stabilo')).id,
      price: 11800,
      stock: 50,
      description: 'Pack de 4 resaltadores con tinta fluida y resistente al agua.',
    },
    {
      name: 'Resaltador BIC Highlighter x4',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('BIC')).id,
      price: 9200,
      stock: 55,
      description: 'Pack de 4 resaltadores fluorescentes con punta cincel.',
    },
    {
      name: 'Corrector en cinta BIC Wite-Out x6',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('BIC')).id,
      price: 14200,
      stock: 35,
      description: '6 correctores en cinta de 5mm, corrección limpia e inmediata.',
    },
    {
      name: 'Notas autoadhesivas Post-it 76x76mm x5',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Post-it')).id,
      price: 13900,
      stock: 40,
      description: 'Pack de 5 bloc de notas autoadhesivas de color amarillo.',
    },
    {
      name: 'Resma papel carta 500 hojas',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 16500,
      stock: 30,
      description: 'Resma de papel bond carta de 75g, 500 hojas.',
    },
    {
      name: 'Sobre manila carta x10',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 7200,
      stock: 80,
      description: 'Paquete de 10 sobres manila tamaño carta.',
    },
    {
      name: 'Clips sujetapapeles x100',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 2400,
      stock: 90,
      description: 'Caja con 100 clips metálicos de 33mm.',
    },
    {
      name: 'Caja de lápices HB x12',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('BIC')).id,
      price: 9800,
      stock: 70,
      description: '12 lápices de grafito HB con goma, el grado ideal escolar.',
    },
    {
      name: 'Borrador Pelikan x3',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Pelikan')).id,
      price: 4600,
      stock: 75,
      description: 'Pack de 3 borradores de nata blancos que no manchan.',
    },
    {
      name: 'Tajalápiz doble Maped',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Maped')).id,
      price: 3800,
      stock: 65,
      description: 'Sacapuntas con dos orificios y depósito de virutas.',
    },
    {
      name: 'Carpeta archivadora 3 argollas',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('Kores')).id,
      price: 11800,
      stock: 30,
      description: 'Carpeta de 3 argollas con tapa dura, color surtido.',
    },
    {
      name: 'Bolígrafo PILOT G2',
      categoryId: (await category('Papelería')).id,
      brandId: (await brand('PILOT')).id,
      price: 6400,
      stock: 55,
      description: 'Bolígrafo retráctil de tinta gel, trazo suave y secado rápido.',
    },
    {
      name: 'Mouse óptico USB Logitech M90',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Logitech')).id,
      price: 38500,
      stock: 25,
      description: 'Mouse óptico USB con cable y seguimiento preciso.',
    },
    {
      name: 'Teclado USB Logitech K120',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Logitech')).id,
      price: 62000,
      stock: 15,
      description: 'Teclado de tamaño completo con teclas de bajo perfil.',
    },
    {
      name: 'Audífonos con cable Logitech H110',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Logitech')).id,
      price: 48000,
      stock: 20,
      description: 'Audífonos con micrófono, sonido claro y confortable.',
    },
    {
      name: 'Webcam Logitech C270',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Logitech')).id,
      price: 132000,
      stock: 8,
      description: 'Webcam HD 720p con micrófono y enfoque automático.',
    },
    {
      name: 'Mouse Genius inalámbrico',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Genius')).id,
      price: 28500,
      stock: 25,
      description: 'Mouse inalámbrico compacto de 2.4GHz, plug and play.',
    },
    {
      name: 'Parlante Genius SP-120',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Genius')).id,
      price: 45000,
      stock: 12,
      description: 'Parlantes estéreo con control de volumen y baja potencia.',
    },
    {
      name: 'Teclado Genius KB-110',
      categoryId: (await category('Tecnología')).id,
      brandId: (await brand('Genius')).id,
      price: 48000,
      stock: 18,
      description: 'Teclado USB de membrana silenciosa con teclado numérico.',
    },
    {
      name: 'Perforadora metálica 2 huecos Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 16500,
      stock: 22,
      description: 'Perforadora metálica de dos huecos con base antideslizante.',
    },
    {
      name: 'Grapadora 26/6 Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 9800,
      stock: 30,
      description: 'Grapadora de escritorio de metal para grapas 26/6.',
    },
    {
      name: 'Caja de grapas 26/6 x5000',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 4200,
      stock: 50,
      description: 'Caja de 5000 grapas 26/6 para uso de oficina y escritorio.',
    },
    {
      name: 'Organizador de escritorio multinivel Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 24800,
      stock: 18,
      description: 'Organizador de escritorio con bandejas y portaútil.',
    },
    {
      name: 'Calculadora de escritorio 12 dígitos Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 29500,
      stock: 20,
      description: 'Calculadora de escritorio de 12 dígitos con impresión térmica.',
    },
    {
      name: 'Dispensador de cinta Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 8900,
      stock: 28,
      description: 'Dispensador de cinta adhesiva con base pesada antideslizante.',
    },
    {
      name: 'Carpeta colgante x10 Luxor',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Luxor')).id,
      price: 15500,
      stock: 35,
      description: 'Paquete de 10 carpetas colgantes tamaño carta con pestañas.',
    },
    {
      name: 'Marcadores de pizarra borrables x4',
      categoryId: (await category('Oficina')).id,
      brandId: (await brand('Kores')).id,
      price: 9800,
      stock: 40,
      description: '4 marcadores de pizarra blanca con punta redonda y tinta lavable.',
    },
    {
      name: 'Témperas x12 Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 18900,
      stock: 32,
      description: 'Set de 12 colores de témperas escolares de alta cobertura.',
    },
    {
      name: 'Plastilina 12 colores Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 9800,
      stock: 40,
      description: 'Caja de plastilina no tóxica con 12 colores surtidos.',
    },
    {
      name: 'Set de pinceles x6 Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 12400,
      stock: 30,
      description: 'Set de 6 pinceles de diferentes grosores con mango de madera.',
    },
    {
      name: 'Acuarelas 24 pastillas Faber-Castell',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Faber-Castell')).id,
      price: 34500,
      stock: 22,
      description: 'Estuche de 24 pastillas de acuarela con pincel.',
    },
    {
      name: 'Vinilos escolares x8 Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 6700,
      stock: 45,
      description: 'Set de 8 vinilos escolares de colores vivos.',
    },
    {
      name: 'Cartulinas iris x10 Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 7200,
      stock: 50,
      description: 'Paquete de 10 cartulinas iris con brillo iridiscente.',
    },
    {
      name: 'Goma en barra 21g x3 Pelikan',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Pelikan')).id,
      price: 5600,
      stock: 60,
      description: 'Pack de 3 pegamento en barra de 21g, sin ácidos.',
    },
    {
      name: 'Papel cartulina x10 Artesco',
      categoryId: (await category('Arte y Manualidades')).id,
      brandId: (await brand('Artesco')).id,
      price: 8600,
      stock: 55,
      description: 'Paquete de 10 pliegos de cartulina blanca 60x45cm.',
    },
    {
      name: 'Set regalo cuaderno + bolígrafo Kores',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Kores')).id,
      price: 28500,
      stock: 12,
      description: 'Caja de regalo con cuaderno argollado y bolígrafo metálico.',
    },
    {
      name: 'Caja lápices premium de regalo Faber-Castell',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Faber-Castell')).id,
      price: 45900,
      stock: 10,
      description: 'Caja de lápices de color premium en estuche de regalo.',
    },
    {
      name: 'Kit acuarelas de regalo Faber-Castell',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Faber-Castell')).id,
      price: 38900,
      stock: 10,
      description: 'Kit de acuarelas con pincel y paleta en empaque de regalo.',
    },
    {
      name: 'Taza Mundo Pórix',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Artesco')).id,
      price: 19800,
      stock: 15,
      description: 'Taza de cerámica con el logo de Mundo Pórix, 350ml.',
    },
    {
      name: 'Marco de fotos de madera Artesco',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Artesco')).id,
      price: 22000,
      stock: 14,
      description: 'Marco de fotos de madera natural para formato 10x15cm.',
    },
    {
      name: 'Rompecabezas de madera 100 piezas Artesco',
      categoryId: (await category('Regalos')).id,
      brandId: (await brand('Artesco')).id,
      price: 16500,
      stock: 18,
      description: 'Rompecabezas de madera con 100 piezas, ideal para regalo.',
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      update: { price: p.price, description: p.description },
      create: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        brandId: p.brandId,
        categoryId: p.categoryId,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        quantity: p.stock,
        reservedQuantity: 0,
      },
    });
  }

  console.log(
    'Seed completado. Roles, usuarios (admin + cliente), categorías, marcas y productos listos.',
  );
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
