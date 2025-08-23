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
import '../shared/types'; // Import Fastify interface extensions

export async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Signup endpoint
  server.post('/signup', {
    schema: SignupRouteSchema
  }, async (request, reply) => {
    const { email, password } = request.body as SignupRequestType;

    // Instantiate dependencies with transaction
    const userRepository = new UserRepository(request.transaction);
    const eventRepository = new EventRepository(request.transaction);

    // Execute register user feature
    const result = await registerUser(
      { email, password },
      { userRepository, eventRepository }
    );

    // Handle result
    if (result.isFailure()) {
      const errorCode = result.error === 'User already exists' ? 409 : 400;
      const code = result.error === 'User already exists' ? 'USER_EXISTS' : 'SIGNUP_ERROR';
      
      return reply.status(errorCode).send({
        error: {
          message: result.error,
          code
        }
      });
    }

    // Generate JWT token
    const userState = result.value.user.getInternalState();
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

    // Instantiate dependencies with transaction
    const userRepository = new UserRepository(request.transaction);
    const eventRepository = new EventRepository(request.transaction);

    // Execute authenticate user feature
    const result = await authenticateUser(
      { email, password },
      { userRepository, eventRepository }
    );

    // Handle result
    if (result.isFailure()) {
      return reply.status(401).send({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate JWT token
    const userState = result.value.user.getInternalState();
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