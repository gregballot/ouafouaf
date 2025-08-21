import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { 
  SignupRouteSchema, 
  LoginRouteSchema,
  type SignupRequestType,
  type LoginRequestType 
} from '@repo/api-schemas';
import { 
  createUser, 
  findUserByEmail, 
  updateLastLogin,
  type DatabaseUser
} from '@repo/database';
import { hashPassword, verifyPassword, generateToken, getTokenExpiration } from '../lib/auth';

export async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Signup endpoint
  server.post('/signup', {
    schema: SignupRouteSchema
  }, async (request, reply) => {
    const { email, password } = request.body as SignupRequestType;

    try {
      // Check if user already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return reply.status(409).send({
          error: {
            message: 'User already exists',
            code: 'USER_EXISTS'
          }
        });
      }

      // Hash password and create user
      const password_hash = await hashPassword(password);
      const user = await createUser({ email, password_hash });

      // Generate token
      const token = generateToken(user);
      const expires_at = getTokenExpiration();

      // Update last login
      await updateLastLogin(user.id);

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login: user.last_login
        },
        token,
        expires_at
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        error: {
          message: 'Failed to create user',
          code: 'SIGNUP_ERROR'
        }
      });
    }
  });

  // Login endpoint
  server.post('/login', {
    schema: LoginRouteSchema
  }, async (request, reply) => {
    const { email, password } = request.body as LoginRequestType;

    try {
      // Find user by email
      const user = await findUserByEmail(email);
      if (!user) {
        return reply.status(401).send({
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      // Verify password
      if (!user.password_hash) {
        return reply.status(401).send({
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        return reply.status(401).send({
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      // Generate token
      const token = generateToken(user);
      const expires_at = getTokenExpiration();

      // Update last login and get the actual timestamp
      const loginTime = new Date().toISOString();
      await updateLastLogin(user.id);

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login: loginTime
        },
        token,
        expires_at
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        error: {
          message: 'Login failed',
          code: 'LOGIN_ERROR'
        }
      });
    }
  });
}