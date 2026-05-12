import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Clothes', slug: 'clothes' },
    { name: 'Phones', slug: 'phones' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Electronics', slug: 'electronics' },
  ];

  for (const cat of categories) {
    await prisma.categories.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, is_active: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        is_active: true,
      },
    });
  }

  console.log('Categories seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });
