import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Force the test suite to use the test database
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '5001';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Push the database schema to test.db to ensure it exists and matches schema.prisma
  try {
    execSync('npx prisma db push --accept-data-loss --force-reset', {
      env: {
        ...process.env,
        DATABASE_URL: 'file:./test.db',
      },
    });
  } catch (error) {
    console.error('Error setting up test database schema:', error);
    throw error;
  }
});

afterAll(async () => {
  // Disconnect prisma client
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear database tables between test runs
  await prisma.user.deleteMany({});
  await prisma.vehicle.deleteMany({});
});
