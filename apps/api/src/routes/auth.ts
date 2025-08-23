import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  SignupRouteSchema,
  LoginRouteSchema,
  type SignupRequestType,
  type LoginRequestType
} from '@repo/api-schemas';
import { UserRepository } from '../domain/User/UserRepository';
import { EventRepository } from '../domain/DomainEvent/EventRepository';
import { registerUser } from '../domain/User/features/register-user';
import { authenticateUser } from '../domain/User/features/authenticate-user';
import { generateToken, getTokenExpiration } from '../lib/auth';
import { withTransaction } from '../shared/transaction';

export async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Signup endpoint
  server.post('/signup', {
    schema: SignupRouteSchema
  }, async (request, reply) => {
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
    const userState = result.user.getInternalState();
    const token = generateToken({
      id: userState.id,
      email: userState.email,
      created_at: userState.createdAt.toISOString(),
      updated_at: userState.updatedAt.toISOString(),
      last_login: userState.lastLogin?.toISOString()
    });
    const expires_at = getTokenExpiration();

    return reply.status(201).send({
      user: {
        id: userState.id,
        email: userState.email,
        created_at: userState.createdAt.toISOString(),
        updated_at: userState.updatedAt.toISOString(),
        last_login: userState.lastLogin?.toISOString()
      },
      token,
      expires_at
    });
  });

  // Login endpoint
  server.post('/login', {
    schema: LoginRouteSchema
  }, async (request, reply) => {
    const { email, password } = request.body as LoginRequestType;

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

    // Generate JWT token
    const userState = result.user.getInternalState();
    const token = generateToken({
      id: userState.id,
      email: userState.email,
      created_at: userState.createdAt.toISOString(),
      updated_at: userState.updatedAt.toISOString(),
      last_login: userState.lastLogin?.toISOString()
    });
    const expires_at = getTokenExpiration();

    return reply.status(200).send({
      user: {
        id: userState.id,
        email: userState.email,
        created_at: userState.createdAt.toISOString(),
        updated_at: userState.updatedAt.toISOString(),
        last_login: userState.lastLogin?.toISOString()
      },
      token,
      expires_at
    });
  });
}