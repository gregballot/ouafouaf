import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  SignupRouteSchema,
  LoginRouteSchema,
  ForgotPasswordRouteSchema,
  type SignupRequestType,
  type LoginRequestType,
  type ForgotPasswordRequestType,
} from '@repo/api-schemas';
import { UserRepository } from '../domain/User/UserRepository';
import { EventRepository } from '../domain/DomainEvent/EventRepository';
import { registerUser } from '../domain/User/features/register-user';
import { authenticateUser } from '../domain/User/features/authenticate-user';
import {
  generateToken,
  getTokenExpiration,
  getCookieMaxAge,
} from '../lib/auth';
import { withTransaction } from '../shared/transaction';
import { InvalidCredentialsError } from '../shared/errors';

export async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Signup endpoint
  server.post(
    '/signup',
    {
      schema: SignupRouteSchema,
    },
    async (request, reply) => {
      const { email, password } = request.body as SignupRequestType;

      const result = await withTransaction(async (trx) => {
        // Instantiate dependencies with transaction
        const userRepository = new UserRepository(trx);
        const eventRepository = new EventRepository(trx);

        // Execute register user feature (throws on error)
        return await registerUser(
          { email, password },
          { userRepository, eventRepository }
        );
      });

      // Generate JWT token
      const userDetails = result.user.details;
      const token = generateToken(userDetails);
      const expires_at = getTokenExpiration();

      // Set httpOnly cookie for token
      reply.setCookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour in milliseconds
        path: '/',
      });

      return reply.status(201).send({
        user: userDetails,
        expires_at,
      });
    }
  );

  // Login endpoint
  server.post(
    '/login',
    {
      schema: LoginRouteSchema,
    },
    async (request, reply) => {
      const {
        email,
        password,
        remember = false,
      } = request.body as LoginRequestType;

      if (!password || typeof password !== 'string') {
        throw new InvalidCredentialsError();
      }

      const result = await withTransaction(async (trx) => {
        // Instantiate dependencies with transaction
        const userRepository = new UserRepository(trx);
        const eventRepository = new EventRepository(trx);

        // Execute authenticate user feature (throws on error)
        return await authenticateUser(
          { email, password },
          { userRepository, eventRepository }
        );
      });

      // Generate JWT token with appropriate expiration based on remember flag
      const userDetails = result.user.details;
      const token = generateToken(userDetails, remember);
      const expires_at = getTokenExpiration(remember);

      // Set httpOnly cookie for token with appropriate maxAge
      reply.setCookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: getCookieMaxAge(remember),
        path: '/',
      });

      return reply.status(200).send({
        user: userDetails,
        expires_at,
      });
    }
  );

  // Forgot password endpoint (dummy implementation)
  server.post(
    '/forgot-password',
    {
      schema: ForgotPasswordRouteSchema,
    },
    async (request, reply) => {
      const { email } = request.body as ForgotPasswordRequestType;

      // TODO: In a real implementation, you would:
      // 1. Check if user exists with this email
      // 2. Generate a secure reset token
      // 3. Store the token with expiration
      // 4. Send email with reset link
      //
      // For now, we just simulate success after a brief delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return reply.status(200).send({
        message: `If an account with ${email} exists, a password reset link has been sent.`,
      });
    }
  );

  // CSRF token endpoint
  server.get('/csrf-token', async (request, reply) => {
    // Generate a simple CSRF token (in a real app, you'd want something more robust)
    const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString(
      'base64'
    );

    return reply.status(200).send({
      token,
    });
  });

  // Get current user endpoint (using cookie auth)
  server.get(
    '/me',
    {
      preHandler: [server.auth],
    },
    async (request, reply) => {
      // User is attached by auth middleware
      const user = request.user;

      return reply.status(200).send({
        user,
      });
    }
  );

  // Logout endpoint
  server.post('/logout', async (request, reply) => {
    // Clear the authentication cookie
    reply.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return reply.status(200).send({
      message: 'Logged out successfully',
    });
  });
}
