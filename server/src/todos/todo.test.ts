import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../app.js';

describe('Todo Endpoints (Owner-Scoped)', () => {
  const app = createApp();

  const registerAndGetToken = async (email: string) => {
    await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Password123!' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });

    return loginRes.body.token as string;
  };

  describe('POST /api/todos', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Buy groceries' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('rejects empty or whitespace-only title with 400 Bad Request', async () => {
      const token = await registerAndGetToken('blanktitle@example.com');

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('creates a new Todo with status "pending" and creation timestamp', async () => {
      const token = await registerAndGetToken('createtodo@example.com');

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Write TypeScript tests' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Write TypeScript tests');
      expect(res.body).toHaveProperty('status', 'pending');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('owner');
    });
  });

  describe('GET /api/todos', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('returns empty array when user has no Todos', async () => {
      const token = await registerAndGetToken('notodos@example.com');

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('enforces strict owner isolation so User A cannot see User B Todos', async () => {
      const tokenA = await registerAndGetToken('usera@example.com');
      const tokenB = await registerAndGetToken('userb@example.com');

      // User A creates 2 todos
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: "User A's First Todo" });

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: "User A's Second Todo" });

      // User B creates 1 todo
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: "User B's Private Todo" });

      // User A fetches todos
      const resA = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body).toHaveLength(2);
      expect(resA.body.map((t: { title: string }) => t.title)).toEqual([
        "User A's First Todo",
        "User A's Second Todo",
      ]);

      // User B fetches todos
      const resB = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body).toHaveLength(1);
      expect(resB.body[0].title).toBe("User B's Private Todo");
    });

    it('rejects invalid status filter with 400 Bad Request', async () => {
      const token = await registerAndGetToken('invalidfilter@example.com');

      const res = await request(app)
        .get('/api/todos?status=unknown')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('filters todos by status: pending, completed, or all', async () => {
      const token = await registerAndGetToken('filteruser@example.com');

      // Create 3 todos
      const t1 = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 1 (pending)' });

      const t2 = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 2 (completed)' });

      const t3 = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 3 (pending)' });

      // Mark Task 2 as completed
      await request(app)
        .patch(`/api/todos/${t2.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      // Query ?status=pending
      const pendingRes = await request(app)
        .get('/api/todos?status=pending')
        .set('Authorization', `Bearer ${token}`);

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body).toHaveLength(2);
      expect(pendingRes.body.map((t: { title: string }) => t.title)).toEqual([
        'Task 1 (pending)',
        'Task 3 (pending)',
      ]);

      // Query ?status=completed
      const completedRes = await request(app)
        .get('/api/todos?status=completed')
        .set('Authorization', `Bearer ${token}`);

      expect(completedRes.status).toBe(200);
      expect(completedRes.body).toHaveLength(1);
      expect(completedRes.body[0].title).toBe('Task 2 (completed)');

      // Query ?status=all
      const allRes = await request(app)
        .get('/api/todos?status=all')
        .set('Authorization', `Bearer ${token}`);

      expect(allRes.status).toBe(200);
      expect(allRes.body).toHaveLength(3);

      // Query without status parameter defaults to all
      const defaultRes = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(defaultRes.status).toBe(200);
      expect(defaultRes.body).toHaveLength(3);
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .patch('/api/todos/6738914b301f463d12345678')
        .send({ status: 'completed' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('rejects invalid status values with 400 Bad Request', async () => {
      const token = await registerAndGetToken('invalidstatus@example.com');
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)\n        .send({ title: 'Task with invalid status' });

      const res = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in-progress' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 404 when updating a non-existent todo', async () => {
      const token = await registerAndGetToken('notfound@example.com');

      const res = await request(app)
        .patch('/api/todos/6738914b301f463d12345678')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');
    });

    it('returns 404 when user attempts to update another user todo (strict owner isolation)', async () => {
      const tokenA = await registerAndGetToken('patchowner_a@example.com');
      const tokenB = await registerAndGetToken('patchowner_b@example.com');

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: "User A's Protected Todo" });

      const res = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');
    });

    it('updates status from pending to completed, and from completed back to pending', async () => {
      const token = await registerAndGetToken('toggleuser@example.com');

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Toggle Me' });

      expect(createRes.body.status).toBe('pending');

      // Toggle to completed
      const completeRes = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.status).toBe('completed');
      expect(completeRes.body.id).toBe(createRes.body.id);

      // Toggle back to pending
      const pendingRes = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'pending' });

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.status).toBe('pending');
    });

    it('rejects empty or whitespace-only title update with 400 Bad Request', async () => {
      const token = await registerAndGetToken('blankupdate@example.com');
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original Title' });

      const res = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('updates title successfully and returns modified item', async () => {
      const token = await registerAndGetToken('titleupdate@example.com');
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original Title' });

      const res = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Title');
      expect(res.body.id).toBe(createRes.body.id);
    });

    it('returns 404 when user attempts to update title of another user todo', async () => {
      const tokenA = await registerAndGetToken('titleowner_a@example.com');
      const tokenB = await registerAndGetToken('titleowner_b@example.com');

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: "User A's Protected Item" });

      const res = await request(app)
        .patch(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: "Hacked Title" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).delete('/api/todos/6738914b301f463d12345678');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('returns 404 when deleting a non-existent todo', async () => {
      const token = await registerAndGetToken('deletenotfound@example.com');

      const res = await request(app)
        .delete('/api/todos/6738914b301f463d12345678')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');
    });

    it('returns 404 when user attempts to delete another user todo (strict owner isolation)', async () => {
      const tokenA = await registerAndGetToken('delowner_a@example.com');
      const tokenB = await registerAndGetToken('delowner_b@example.com');

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: "User A's Item to Keep" });

      // User B tries to delete User A's item
      const res = await request(app)
        .delete(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');

      // Verify item still exists for User A
      const verifyRes = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(verifyRes.body).toHaveLength(1);
    });

    it('permanently removes owned todo and returns success confirmation', async () => {
      const token = await registerAndGetToken('deluser@example.com');

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Item to be Deleted' });

      const delRes = await request(app)
        .delete(`/api/todos/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body).toHaveProperty('message', 'Todo deleted successfully');

      // Verify item is no longer returned in GET /api/todos
      const listRes = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body).toEqual([]);
    });
  });
});
