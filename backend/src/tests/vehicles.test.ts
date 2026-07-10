import request from 'supertest';
import app from '../app';
import prisma from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Vehicles Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let existingVehicleId: string;

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

    // Create a seed vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 24000.0,
        quantity: 5,
      },
    });
    existingVehicleId = vehicle.id;
  });

  describe('GET /api/vehicles', () => {
    it('should return 401 if token is not provided', async () => {
      const response = await request(app).get('/api/vehicles');
      expect(response.status).toBe(401);
    });

    it('should return 403 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(403);
    });

    it('should return list of vehicles if authenticated', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].make).toBe('Toyota');
    });
  });

  describe('POST /api/vehicles', () => {
    it('should allow users to add a new vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: 22000.0,
          quantity: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.make).toBe('Honda');

      const count = await prisma.vehicle.count();
      expect(count).toBe(2);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Honda',
          // missing model, category, etc.
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      // Create additional vehicles to test search filters
      await prisma.vehicle.create({
        data: { make: 'Ford', model: 'F-150', category: 'Truck', price: 35000.0, quantity: 2 },
      });
      await prisma.vehicle.create({
        data: { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000.0, quantity: 4 },
      });
    });

    it('should search vehicles by make', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?make=Toyota')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // Toyota Camry & Toyota RAV4
    });

    it('should search vehicles by model', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?model=F-150')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].make).toBe('Ford');
    });

    it('should search vehicles by category', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?category=Sedan')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].model).toBe('Camry');
    });

    it('should search vehicles by price range', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?priceMin=25000&priceMax=36000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // Ford F-150 (35000) & Toyota RAV4 (28000)
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should allow users to update vehicle details', async () => {
      const response = await request(app)
        .put(`/api/vehicles/${existingVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: 25000.0,
          quantity: 6,
        });

      expect(response.status).toBe(200);
      expect(response.body.price).toBe(25000.0);
      expect(response.body.quantity).toBe(6);

      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: existingVehicleId },
      });
      expect(dbVehicle!.price).toBe(25000.0);
    });

    it('should return 404 for updating a non-existent vehicle', async () => {
      const response = await request(app)
        .put('/api/vehicles/non-existent-uuid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 30000.0 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should block non-admin users from deleting a vehicle', async () => {
      const response = await request(app)
        .delete(`/api/vehicles/${existingVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);

      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: existingVehicleId },
      });
      expect(dbVehicle).not.toBeNull();
    });

    it('should allow admins to delete a vehicle', async () => {
      const response = await request(app)
        .delete(`/api/vehicles/${existingVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const dbVehicle = await prisma.vehicle.findUnique({
        where: { id: existingVehicleId },
      });
      expect(dbVehicle).toBeNull();
    });

    it('should return 404 for deleting a non-existent vehicle as admin', async () => {
      const response = await request(app)
        .delete('/api/vehicles/non-existent-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
