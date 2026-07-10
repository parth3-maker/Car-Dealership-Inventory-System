import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.user.deleteMany({});
  await prisma.vehicle.deleteMany({});

  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@velocity.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@velocity.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Created Users:', {
    admin: admin.email,
    customer: customer.email,
  });

  // Create Vehicles
  const vehicles = [
    {
      make: 'Tesla',
      model: 'Model S Plaid',
      category: 'Electric',
      price: 89990.0,
      quantity: 5,
    },
    {
      make: 'Porsche',
      model: '911 GT3 RS',
      category: 'Sports',
      price: 223800.0,
      quantity: 1,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      price: 31200.0,
      quantity: 12,
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Truck',
      price: 55900.0,
      quantity: 3,
    },
    {
      make: 'Chevrolet',
      model: 'Bolt EV',
      category: 'Hatchback',
      price: 26500.0,
      quantity: 0, // Out of stock to test disabled purchase state
    },
  ];

  for (const car of vehicles) {
    const created = await prisma.vehicle.create({ data: car });
    console.log(`Created Vehicle: ${created.make} ${created.model} (${created.quantity} in stock)`);
  }

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
