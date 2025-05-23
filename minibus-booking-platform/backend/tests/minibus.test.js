// minibus-booking-platform/backend/tests/minibus.test.js
const request = require('supertest');
const app = require('../app'); // Corrected path
const mongoose = require('mongoose');
const Minibus = require('../models/Minibus');
const User = require('../models/User'); // For creating admin/user for tokens

let adminToken;
let userToken;
let adminUserId;
let regularUserId;

// Utility to clear collections
const clearMinibuses = async () => { await Minibus.deleteMany({}); };
const clearUsers = async () => { await User.deleteMany({}); };

beforeAll(async () => {
  await clearUsers(); // Clear users before creating new ones for token generation

  // Create an admin user and get token
  const adminUser = { username: 'minibusAdmin', password: 'password123', role: 'admin' };
  // For admin, we use register-admin which should directly give a token and user details
  const adminRegRes = await request(app).post('/api/auth/register-admin').send(adminUser);
  console.log('Minibus Test Admin Reg Res Body:', adminRegRes.body);
  adminToken = adminRegRes.body.token;
  adminUserId = adminRegRes.body.user?._id; // Safely access _id


  // Create a regular user and get token
  const regularUser = { username: 'minibusUser', password: 'password123' };
  await request(app).post('/api/auth/register').send(regularUser);
  const userLoginRes = await request(app).post('/api/auth/login').send(regularUser);
  console.log('Minibus Test User Login Res Body:', userLoginRes.body);
  userToken = userLoginRes.body.token;
  regularUserId = userLoginRes.body.user?._id; // Safely access _id
});

beforeEach(async () => {
  await clearMinibuses();
});

describe('Minibus API (/api/minibuses)', () => {
  const minibusData = {
    name: 'Test Bus 001',
    capacity: 15,
    licensePlate: 'TESTBUS001',
    status: 'active',
    features: ['AC', 'WiFi'],
  };

  // Test POST /api/minibuses (Create Minibus)
  describe('POST /', () => {
    it('should create a new minibus if user is admin', async () => {
      const res = await request(app)
        .post('/api/minibuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(minibusData);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual(minibusData.name);
      expect(res.body.licensePlate).toEqual(minibusData.licensePlate);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/minibuses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Bus' }); // Missing capacity, licensePlate
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Missing required fields: name, capacity, licensePlate');
    });
    
    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/minibuses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(minibusData);
      expect(res.statusCode).toEqual(403);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post('/api/minibuses')
        .send(minibusData);
      expect(res.statusCode).toEqual(401);
    });
  });

  // Test GET /api/minibuses (Get All Minibuses)
  describe('GET /', () => {
    it('should get all minibuses if user is admin', async () => {
      await Minibus.create(minibusData);
      const res = await request(app)
        .get('/api/minibuses')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toEqual(minibusData.name);
    });
    
    it('should return 403 if user is not admin', async () => {
        const res = await request(app)
          .get('/api/minibuses')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403);
      });
  
      it('should return 401 if user is not authenticated', async () => {
        const res = await request(app)
          .get('/api/minibuses');
        expect(res.statusCode).toEqual(401);
      });
  });

  // Test GET /api/minibuses/:id (Get Single Minibus)
  describe('GET /:id', () => {
    let testMinibus;
    beforeEach(async () => {
      testMinibus = await Minibus.create(minibusData);
    });

    it('should get a single minibus by ID if user is admin', async () => {
      const res = await request(app)
        .get(`/api/minibuses/${testMinibus._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(minibusData.name);
    });

    it('should return 404 if minibus not found (admin access)', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/minibuses/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
    
    it('should return 403 if user is not admin', async () => {
        const res = await request(app)
          .get(`/api/minibuses/${testMinibus._id}`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 401 if user is not authenticated', async () => {
    const res = await request(app)
        .get(`/api/minibuses/${testMinibus._id}`);
    expect(res.statusCode).toEqual(401);
    });
  });

  // Test PUT /api/minibuses/:id (Update Minibus)
  describe('PUT /:id', () => {
    let testMinibus;
    beforeEach(async () => {
      testMinibus = await Minibus.create(minibusData);
    });

    it('should update a minibus if user is admin', async () => {
      const updatedData = { name: 'Updated Test Bus', capacity: 20 };
      const res = await request(app)
        .put(`/api/minibuses/${testMinibus._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(updatedData.name);
      expect(res.body.capacity).toEqual(updatedData.capacity);
    });

    it('should return 404 if minibus to update not found (admin access)', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/minibuses/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Bus' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not admin', async () => {
        const res = await request(app)
          .put(`/api/minibuses/${testMinibus._id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ name: 'User Update Attempt' });
        expect(res.statusCode).toEqual(403);
    });
  });

  // Test DELETE /api/minibuses/:id (Delete Minibus)
  describe('DELETE /:id', () => {
    let testMinibus;
    beforeEach(async () => {
      testMinibus = await Minibus.create(minibusData);
    });

    it('should delete a minibus if user is admin', async () => {
      const res = await request(app)
        .delete(`/api/minibuses/${testMinibus._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Minibus removed successfully');
      
      const foundMinibus = await Minibus.findById(testMinibus._id);
      expect(foundMinibus).toBeNull();
    });

    it('should return 404 if minibus to delete not found (admin access)', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/minibuses/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not admin', async () => {
        const res = await request(app)
          .delete(`/api/minibuses/${testMinibus._id}`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403);
    });
  });
});
