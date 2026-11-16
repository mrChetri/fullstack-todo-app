import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { authRouter } from './auth/auth.routes.js';
import { todoRouter } from './todos/todo.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api/todos', todoRouter);

  app.get('/api/health', (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
      },
    });
  });

  return app;
}
