import request from 'supertest';
import app from '../app';
import prisma from '../db';

describe('Auth Endpoints', () => {
  const registerRoute = '/api/auth/register';
  const loginRoute = '/api/auth/login';

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully as USER by default', async () => {
      const response = await request(app)
        .post(registerRoute)
        .send({
          email: 'testuser@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('testuser@example.com');
      expect(response.body.role).toBe('USER');
      expect(response.body).not.toHaveProperty('password');

      // Verify db state
      const dbUser = await prisma.user.findUnique({
        where: { email: 'testuser@example.com' },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser!.role).toBe('USER');
    });

    it('should register an admin user if role is explicitly ADMIN', async () => {
      const response = await request(app)
        .post(registerRoute)
        .send({
          email: 'adminuser@example.com',
          password: 'AdminPassword123!',
          role: 'ADMIN',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('ADMIN');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post(registerRoute)
        .send({
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post(registerRoute)
        .send({
          email: 'testuser@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if user email is already registered', async () => {
      // First registration
      await request(app)
        .post(registerRoute)
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
        });

      // Duplicate registration
      const response = await request(app)
        .post(registerRoute)
        .send({
          email: 'duplicate@example.com',
          password: 'Password456!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register user for login tests
      await request(app)
        .post(registerRoute)
        .send({
          email: 'loginuser@example.com',
          password: 'Password123!',
        });
    });

    it('should authenticate user and return a JWT token', async () => {
      const response = await request(app)
        .post(loginRoute)
        .send({
          email: 'loginuser@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('loginuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post(loginRoute)
        .send({
          email: 'loginuser@example.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post(loginRoute)
        .send({
          email: 'notfound@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if email or password are missing', async () => {
      const response = await request(app)
        .post(loginRoute)
        .send({
          email: 'loginuser@example.com',
        });

      expect(response.status).toBe(400);
    });
  });
});
