export { createPool, getConnection } from './connection';
export type { DatabaseConfig } from './types';
export { 
  createUser, 
  findUserByEmail, 
  findUserByEmailAndPassword, 
  updateLastLogin,
  type CreateUserParams,
  type AuthUserParams,
  type DatabaseUser
} from './auth';