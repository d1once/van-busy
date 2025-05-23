// minibus-booking-platform/backend/tests/destination.test.js
const request = require('supertest');
const app = require('../app'); // Corrected path
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const User = require('../models/User');

let adminToken;
let userToken;

// Utility to clear collections
const clearDestinations = async () => { await Destination.deleteMany({}); };
const clearUsers = async () => { await User.deleteMany({}); };

beforeAll(async () => {
  await clearUsers();

  const adminUser = { username: 'destAdmin', password: 'password123', role: 'admin' };
  const adminRegRes = await request(app).post('/api/auth/register-admin').send(adminUser);
  console.log('Destination Test Admin Reg Res Body:', adminRegRes.body);
  adminToken = adminRegRes.body.token;
  // adminUserId = adminRegRes.body.user?._id; // Not strictly needed unless used in tests

  const regularUser = { username: 'destUser', password: 'password123' };
  await request(app).post('/api/auth/register').send(regularUser);
  const userLoginRes = await request(app).post('/api/auth/login').send(regularUser);
  console.log('Destination Test User Login Res Body:', userLoginRes.body);
  userToken = userLoginRes.body.token;
  // regularUserId = userLoginRes.body.user?._id; // Not strictly needed
});

beforeEach(async () => {
  await clearDestinations();
});

describe('Destination API (/api/destinations)', () => {
  const destinationData = {
    name: 'Test Destination Alpha',
    location: 'Test Location Alpha',
    description: 'A beautiful test destination.',
    price: 100,
    status: 'available',
    imageUrl: 'http://example.com/image.jpg',
  };

  // Test POST /api/destinations (Create Destination)
  describe('POST /', () => {
    it('should create a new destination if user is admin', async () => {
      const res = await request(app)
        .post('/api/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(destinationData);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual(destinationData.name);
    });

    it('should return 400 if required fields are missing (admin access)', async () => {
        const res = await request(app)
          .post('/api/destinations')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Incomplete Dest' }); // Missing location, description, price
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Missing required fields: name, location, description, price');
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/destinations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(destinationData);
      expect(res.statusCode).toEqual(403);
    });
  });

  // Test GET /api/destinations (Get All Destinations for Admin)
  describe('GET / (Admin)', () => {
    it('should get all destinations if user is admin', async () => {
      await Destination.create(destinationData);
      const res = await request(app)
        .get('/api/destinations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return 403 if non-admin tries to get all destinations via admin route', async () => {
        const res = await request(app)
          .get('/api/destinations')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403);
    });
  });

  // Test GET /api/destinations/available (Get Available Destinations - Public)
  describe('GET /available (Public)', () => {
    it('should get all available destinations for any user (public)', async () => {
      await Destination.create({ ...destinationData, name: 'Available Dest', status: 'available' });
      await Destination.create({ ...destinationData, name: 'Unavailable Dest', licensePlate: 'UNAVDEST', status: 'unavailable' }); // Need unique licensePlate if model had it
      const res = await request(app).get('/api/destinations/available');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every(d => d.status === 'available')).toBe(true);
    });
  });

  // Test GET /api/destinations/:id (Get Single Destination)
  describe('GET /:id (Admin)', () => {
    let testDestination;
    beforeEach(async () => {
      testDestination = await Destination.create(destinationData);
    });

    it('should get a single destination by ID if user is admin', async () => {
      const res = await request(app)
        .get(`/api/destinations/${testDestination._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(destinationData.name);
    });
    
    it('should return 403 if non-admin tries to get a specific destination via admin route', async () => {
        const res = await request(app)
          .get(`/api/destinations/${testDestination._id}`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(403); // Assuming this route is also admin protected
    });
  });

  // Test PUT /api/destinations/:id (Update Destination)
  describe('PUT /:id (Admin)', () => {
    let testDestination;
    beforeEach(async () => {
      testDestination = await Destination.create(destinationData);
    });

    it('should update a destination if user is admin', async () => {
      const updatedData = { name: 'Updated Destination Alpha', price: 120 };
      const res = await request(app)
        .put(`/api/destinations/${testDestination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(updatedData.name);
      expect(res.body.price).toEqual(updatedData.price);
    });
  });

  // Test DELETE /api/destinations/:id (Delete Destination)
  describe('DELETE /:id (Admin)', () => {
    let testDestination;
    beforeEach(async () => {
      testDestination = await Destination.create(destinationData);
    });

    it('should delete a destination if user is admin', async () => {
      const res = await request(app)
        .delete(`/api/destinations/${testDestination._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Destination removed successfully');
      const found = await Destination.findById(testDestination._id);
      expect(found).toBeNull();
    });
  });
});
