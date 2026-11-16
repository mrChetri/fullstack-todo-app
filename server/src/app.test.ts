import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from './app.js';

describe('GET /api/health', () => {
  const app = createApp();

  it('returns 200 OK with server and database status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status', 'connected');
  });
});
