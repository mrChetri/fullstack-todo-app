import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema.js';
import {
  registerUser,
  loginUser,
  AuthConflictError,
  AuthUnauthorizedError,
} from './auth.service.js';
import { requireAuth } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
    res.status(400).json({ error: errorMessages });
    return;
  }

  try {
    const newUser = await registerUser(parseResult.data);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof AuthConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
    res.status(400).json({ error: errorMessages });
    return;
  }

  try {
    const loginResult = await loginUser(parseResult.data);
    res.status(200).json(loginResult);
  } catch (error) {
    if (error instanceof AuthUnauthorizedError) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.get('/me', requireAuth, (req: Request, res: Response): void => {
  res.status(200).json(req.user);
});
