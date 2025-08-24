import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../shared/errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function cookieAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.authToken;

  if (!token) {
    throw new UnauthorizedError('Authentication token not found');
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Attach user info to request
    request.user = {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    // Clear invalid cookie
    reply.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    throw new UnauthorizedError('Invalid authentication token');
  }
}
