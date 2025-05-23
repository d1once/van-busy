// minibus-booking-platform/backend/tests/booking.test.js
const request = require('supertest');
const app = require('../app'); // Corrected path
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Minibus = require('../models/Minibus');
const Destination = require('../models/Destination');

let adminToken, userToken, user2Token;
let adminUserId, regularUserId, user2Id;
let testMinibus, testMinibus2;
let testDestination, testDestination2;

// Utility to clear collections
const clearBookings = async () => { await Booking.deleteMany({}); };
const clearUsers = async () => { await User.deleteMany({}); };
const clearMinibuses = async () => { await Minibus.deleteMany({}); };
const clearDestinations = async () => { await Destination.deleteMany({}); };

beforeAll(async () => {
  await clearUsers();
  await clearMinibuses();
  await clearDestinations();

  // Create admin user
  const adminUserData = { username: 'bookingAdmin', password: 'password123', role: 'admin' };
  const adminRegRes = await request(app).post('/api/auth/register-admin').send(adminUserData);
  console.log('Booking Test Admin Reg Res Body:', adminRegRes.body);
  adminToken = adminRegRes.body.token;
  adminUserId = adminRegRes.body.user?.id; // Corrected to .id

  // Create regular user 1
  const regularUserData = { username: 'bookingUser', password: 'password123' };
  await request(app).post('/api/auth/register').send(regularUserData);
  const userLoginRes = await request(app).post('/api/auth/login').send(regularUserData);
  console.log('Booking Test User1 Login Res Body:', userLoginRes.body);
  userToken = userLoginRes.body.token;
  regularUserId = userLoginRes.body.user?.id; // Corrected to .id
  
  // Create regular user 2
  const user2Data = { username: 'bookingUser2', password: 'password123' };
  await request(app).post('/api/auth/register').send(user2Data);
  const user2LoginRes = await request(app).post('/api/auth/login').send(user2Data);
  console.log('Booking Test User2 Login Res Body:', user2LoginRes.body);
  user2Token = user2LoginRes.body.token;
  user2Id = user2LoginRes.body.user?.id; // Corrected to .id


  // Create Minibuses
  testMinibus = await new Minibus({ name: 'Bus Alpha', capacity: 10, licensePlate: 'MBALPHA', status: 'active' }).save();
  testMinibus2 = await new Minibus({ name: 'Bus Beta', capacity: 5, licensePlate: 'MBBETA', status: 'active' }).save();

  // Create Destinations
  testDestination = await new Destination({ name: 'Dest X', location: 'Loc X', description: 'Desc X', price: 50, status: 'available' }).save();
  testDestination2 = await new Destination({ name: 'Dest Y', location: 'Loc Y', description: 'Desc Y', price: 75, status: 'available' }).save();
});

beforeEach(async () => {
  await clearBookings();
});

describe('Booking API (/api/bookings)', () => {
  const bookingData = () => ({
    destinationId: testDestination._id.toString(),
    minibusId: testMinibus._id.toString(),
    bookingDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // 5 days from now
  });

  // Test POST /api/bookings (Create Booking)
  describe('POST /', () => {
    it('should create a new booking for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData());
      expect(res.statusCode).toEqual(201);
      expect(res.body.booking).toHaveProperty('_id');
      
      // Debugging logs
      console.log('Debug regularUserId:', regularUserId, 'Type:', typeof regularUserId);
      console.log('Debug API Response booking.user:', JSON.stringify(res.body.booking.user, null, 2));
      console.log('Debug API Response booking.destination:', JSON.stringify(res.body.booking.destination, null, 2));
      console.log('Debug testDestination._id:', testDestination._id, 'Type:', typeof testDestination._id);


      // Corrected assertion: API returns populated user object with _id
      expect(res.body.booking.user._id).toEqual(regularUserId); 
      // Corrected assertion: API returns populated destination object with _id
      expect(res.body.booking.destination._id).toEqual(testDestination._id.toString());
      expect(res.body.booking.status).toEqual('pending'); // Default status
    });

    it('should return 400 if required fields are missing', async () => {
      const { destinationId, ...incompleteData } = bookingData();
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(incompleteData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Destination ID, Minibus ID, and Booking Date are required.');
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send(bookingData());
      expect(res.statusCode).toEqual(401); // Or 403 depending on how protect middleware is set without token
    });
    
    it('should return 400 if minibus is not available on the selected date', async () => {
        // First, create a booking for testMinibus on bookingDate
        await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send(bookingData());

        // Attempt to create another booking for the same minibus on the same date by another user
        const res = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${user2Token}`) 
            .send(bookingData());
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Minibus not available on this date.');
    });
  });

  // Test GET /api/bookings/my-bookings (Get User's Own Bookings)
  describe('GET /my-bookings', () => {
    it('should get bookings for the authenticated user', async () => {
      // Ensure all required fields are provided for bookings
      await new Booking({ 
        user: regularUserId, 
        minibus: testMinibus._id, 
        destination: testDestination._id, 
        bookingDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: 'pending' 
      }).save();
      await new Booking({ 
        user: user2Id, 
        minibus: testMinibus2._id, 
        destination: testDestination2._id, 
        bookingDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString(),
        status: 'confirmed'
      }).save();

      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].user.toString()).toEqual(regularUserId.toString());
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app).get('/api/bookings/my-bookings');
      expect(res.statusCode).toEqual(401);
    });
  });

  // --- Admin Booking Routes ---
  describe('Admin Booking Routes', () => {
    let bookingIdForAdminTest;
    beforeEach(async () => {
        // Create a booking by user1 to be managed by admin
        const booking = await new Booking({ 
            user: regularUserId, 
            minibus: testMinibus._id, 
            destination: testDestination._id, 
            bookingDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
            status: 'pending'
        }).save();
        bookingIdForAdminTest = booking._id.toString();
    });

    // Test GET /api/bookings/admin/all
    it('GET /admin/all - should get all bookings if user is admin', async () => {
      // Create another booking by user2 to ensure multiple bookings are fetched
      await new Booking({ 
        user: user2Id, 
        minibus: testMinibus2._id, 
        destination: testDestination2._id, 
        bookingDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
        status: 'confirmed' 
      }).save();
      const res = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /admin/all - should return 403 if user is not admin', async () => {
      const res = await request(app)
        .get('/api/bookings/admin/all')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(403);
    });
    
    // Test GET /api/bookings/admin/:id
    it('GET /admin/:id - should get a specific booking by ID if user is admin', async () => {
        const res = await request(app)
          .get(`/api/bookings/admin/${bookingIdForAdminTest}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body._id.toString()).toEqual(bookingIdForAdminTest);
    });

    it('GET /admin/:id - should return 404 if booking not found (admin access)', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .get(`/api/bookings/admin/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
    });

    // Test PUT /api/bookings/admin/cancel/:id
    it('PUT /admin/cancel/:id - should cancel a booking if user is admin', async () => {
      const res = await request(app)
        .put(`/api/bookings/admin/cancel/${bookingIdForAdminTest}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(); // No body needed for cancellation
      expect(res.statusCode).toEqual(200);
      expect(res.body.booking.status).toEqual('cancelled');
      expect(res.body.message).toEqual('Booking cancelled successfully by admin.');
      
      const cancelledBooking = await Booking.findById(bookingIdForAdminTest);
      expect(cancelledBooking.status).toEqual('cancelled');
    });

    it('PUT /admin/cancel/:id - should return 400 if booking is already cancelled (admin access)', async () => {
        // First, cancel the booking
        await request(app)
          .put(`/api/bookings/admin/cancel/${bookingIdForAdminTest}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send();
        
        // Attempt to cancel again
        const res = await request(app)
          .put(`/api/bookings/admin/cancel/${bookingIdForAdminTest}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send();
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Booking is already cancelled.');
    });
  });
});
