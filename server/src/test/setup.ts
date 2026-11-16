import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

dotenv.config();

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/todo-test-db';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
    // Drop the entire real test database cleanly as required
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});
