import request from 'supertest';
import app from '../app';
import prisma from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Inventory Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let testVehicleId: string;
  let outOfStockVehicleId: string;

  beforeEach(async () => {
    // Set up test users in db
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: 'hashedpassword',
        role: 'USER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: 'hashedpassword',
        role: 'ADMIN',
      },
    });

    // Generate JWT tokens
    userToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET);

    // Create a seed vehicle with stock
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Ford',
        model: 'Mustang',
        category: 'Sports',
        price: 45000.0,
        quantity: 2,
      },
    });
    testVehicleId = vehicle.id;

    // Create a seed vehicle with zero stock
    const oosVehicle = await prisma.vehicle.create({
      data: {
        make: 'Chevrolet',
        model: 'Bolt',
        category: 'Hatchback',
        price: 31000.0,
        quantity: 0,
      },
    });
    outOfStockVehicleId = oosVehicle.id;
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow authenticated users to purchase a vehicle, decreasing its stock by 1', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(1);

      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: testVehicleId },
      });
      expect(dbVehicle!.quantity).toBe(1);
    });

    it('should return 400 if vehicle is out of stock', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      
      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: outOfStockVehicleId },
      });
      expect(dbVehicle!.quantity).toBe(0);
    });

    it('should return 404 if vehicle does not exist', async () => {
      const response = await request(app)
        .post('/api/vehicles/non-existent-uuid/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 if unauthenticated', async () => {
      const response = await request(app).post(`/api/vehicles/${testVehicleId}/purchase`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should block non-admin users from restocking a vehicle', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(403);
    });

    it('should allow admin users to restock a vehicle, increasing its stock', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(7); // 2 + 5 = 7

      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: testVehicleId },
      });
      expect(dbVehicle!.quantity).toBe(7);
    });

    it('should return 400 if restock quantity is missing, not a number, or less than 1', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -2 });

      expect(response.status).toBe(400);

      const response2 = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response2.status).toBe(400);
    });

    it('should return 404 if vehicle does not exist', async () => {
      const response = await request(app)
        .post('/api/vehicles/non-existent-uuid/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(404);
    });
  });
});
