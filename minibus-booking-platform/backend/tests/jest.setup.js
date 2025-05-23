// minibus-booking-platform/backend/tests/jest.setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.test variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri; // Set MONGODB_URI for the application to use

  // It's good practice to ensure mongoose uses a new connection for tests
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri, {
    // useNewUrlParser: true, // These are deprecated but might be needed for older Mongoose
    // useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

// Optional: Clear all collections before each test suite or test
// This ensures tests are independent. Can be done here or in specific test files.
// async function clearDatabase() {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany({});
//   }
// }

// beforeEach(async () => {
//   await clearDatabase();
// });
