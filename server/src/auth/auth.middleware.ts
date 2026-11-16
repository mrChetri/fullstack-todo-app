import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from './auth.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev-learning-typescript-12345';

// Extend Express Request interface with typed user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (_err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
