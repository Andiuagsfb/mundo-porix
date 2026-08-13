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

  const brands = ['Faber-Castell', 'BIC', 'Paper Mate', 'Maped', 'Kores'];
  for (const name of brands) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log('Seed completado. Roles, admin, categorías y marcas listos.');
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
