import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from './user.model.js';
import { RegisterInput, LoginInput } from './auth.schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev-learning-typescript-12345';

export class AuthConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthConflictError';
  }
}

export class AuthUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthUnauthorizedError';
  }
}

export interface AuthUserPayload {
  id: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: AuthUserPayload;
}

export async function registerUser(input: RegisterInput): Promise<AuthUserPayload> {
  const normalizedEmail = input.email.toLowerCase().trim();

  const existingUser = await UserModel.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthConflictError('A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    email: normalizedEmail,
    password: hashedPassword,
  });

  return {
    id: String(user._id),
    email: user.email,
  };
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const normalizedEmail = input.email.toLowerCase().trim();

  const user = await UserModel.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AuthUnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AuthUnauthorizedError('Invalid email or password');
  }

  const payload: AuthUserPayload = {
    id: String(user._id),
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: payload,
  };
}
