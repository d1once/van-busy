// minibus-booking-platform/backend/tests/auth.test.js
const request = require('supertest');
const app = require('../app'); // Corrected path
const mongoose = require('mongoose');
const User = require('../models/User');

// Utility to clear the User collection before each test in this suite
const clearUsers = async () => {
  await User.deleteMany({});
};

beforeEach(async () => {
  await clearUsers();
});

describe('Auth API', () => {
  // Test User Registration
  describe('POST /api/auth/register (User Registration)', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          // email: 'testuser@example.com' // Assuming email is not strictly required by backend for User model
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully. Please login.');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('should fail to register a user with an existing username', async () => {
      await User.create({ username: 'existinguser', password: 'password123', role: 'user' });
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'newpassword123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  // Test User Login
  describe('POST /api/auth/login (User/Admin Login)', () => {
    beforeEach(async () => {
      const salt = await require('bcryptjs').genSalt(10);
      const hashedPassword = await require('bcryptjs').hash('password123', salt);
      await User.create({ username: 'loginuser', password: hashedPassword, role: 'user' });
      await User.create({ username: 'adminuser', password: hashedPassword, role: 'admin' });
    });

    it('should login a registered user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'loginuser');
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('should login an admin user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'adminuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'adminuser');
      expect(res.body.user).toHaveProperty('role', 'admin');
    });
    
    it('should fail to login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(400);
      // Message could be 'Invalid credentials (password mismatch)' or similar
      expect(res.body).toHaveProperty('message'); 
    });

    it('should fail to login a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      // Message could be 'Invalid credentials (user not found)' or similar
      expect(res.body).toHaveProperty('message');
    });
  });

  // Test Admin Registration (POST /api/auth/register-admin)
  // This route is typically protected or used for initial setup.
  // For testing, we might need an existing admin token or a temporary open setup.
  // Assuming for now it's available for testing without prior auth for simplicity,
  // or that it's the first admin being created.
  describe('POST /api/auth/register-admin', () => {
    it('should register a new admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register-admin')
        .send({
          username: 'newadmin',
          password: 'adminpassword123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Admin user registered successfully.');
      expect(res.body.user).toHaveProperty('username', 'newadmin');
      expect(res.body.user).toHaveProperty('role', 'admin');
      expect(res.body).toHaveProperty('token'); // Admin registration returns a token
    });
  });


  // Middleware tests are more complex as they require setting up protected routes.
  // These will be implicitly tested when testing protected API endpoints in other files.
  // For example, when testing POST /api/minibuses (which requires admin),
  // we'll test with and without a valid admin token.
});
