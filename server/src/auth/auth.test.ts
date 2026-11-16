import request from 'supertest';
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { UserModel } from './user.model.js';

describe('POST /api/auth/register', () => {
  const app = createApp();

  it('registers a new user with valid credentials, returning 201 and user info without password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).not.toHaveProperty('password');

    // Verify stored in real MongoDB and password is encrypted
    const userInDb = await UserModel.findOne({ email: 'test@example.com' });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe('Password123!');
    expect(userInDb!.password).toMatch(/^\$2[aby]\$/);
  });

  it('rejects registration with invalid email format with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects registration with a password shorter than 6 characters with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'valid@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects duplicate email registration with 409 Conflict', async () => {
    // Register first user
    const firstRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicate@example.com', password: 'Password123!' });
    expect(firstRes.status).toBe(201);

    // Attempt second registration with same email
    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicate@example.com', password: 'AnotherPassword456!' });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body).toHaveProperty('error', 'A user with this email already exists');
  });
});

describe('POST /api/auth/login', () => {
  const app = createApp();

  it('authenticates user with valid credentials, returning 200 with JWT and user details', async () => {
    // First register user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'loginuser@example.com', password: 'Password123!' });

    // Then login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'loginuser@example.com', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(typeof loginRes.body.token).toBe('string');
    expect(loginRes.body).toHaveProperty('user');
    expect(loginRes.body.user).toHaveProperty('email', 'loginuser@example.com');
    expect(loginRes.body.user).not.toHaveProperty('password');
  });

  it('rejects login with incorrect password with 401 Unauthorized', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'wrongpass@example.com', password: 'Password123!' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpass@example.com', password: 'IncorrectPassword999!' });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body).toHaveProperty('error', 'Invalid email or password');
  });

  it('rejects login with non-existent email with 401 Unauthorized', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Password123!' });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body).toHaveProperty('error', 'Invalid email or password');
  });
});

describe('Authentication Middleware (Protected Routes)', () => {
  const app = createApp();

  it('rejects unauthenticated request to protected route with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Authentication required');
  });

  it('rejects request with invalid or malformed bearer token with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid or expired token');
  });

  it('allows access to protected route when valid bearer token is provided', async () => {
    // Register and login to obtain token
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'meuser@example.com', password: 'Password123!' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'meuser@example.com', password: 'Password123!' });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty('email', 'meuser@example.com');
    expect(meRes.body).toHaveProperty('id');
  });
});
