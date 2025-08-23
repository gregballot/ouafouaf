import { FastifyInstance, FastifyError } from 'fastify';
import { isDomainError } from './errors';

// Global error handler that converts domain errors to HTTP responses
export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    // Log the error for debugging
    fastify.log.error({ error, url: request.url, method: request.method }, 'Request error');

    // Handle domain errors
    if (isDomainError(error)) {
      return reply.status(error.httpStatus).send(error.toResponse());
    }

    // Handle validation errors from Fastify/TypeBox
    if (error.validation) {
      return reply.status(400).send({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.validation
        }
      });
    }

    // Handle other known Fastify errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: {
          message: error.message,
          code: 'REQUEST_ERROR'
        }
      });
    }

    // Unknown errors - don't leak internal details
    fastify.log.error({ error }, 'Unhandled error');
    return reply.status(500).send({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  });
}

// Helper function to throw async errors in routes
export async function asyncHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  return await fn();
}