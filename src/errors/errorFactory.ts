import { NotFoundError } from './NotFoundError';
import { ValidationError } from './ValidationError';
import { UnauthorizedError } from './UnauthorizedError';
import { ForbiddenError } from './ForbiddenError';
import { DatabaseError } from './DatabaseError';
import { ConflictError } from './ConflictError';

/**
 * Error factory utility functions for creating common errors
 *
 * @example
 * throw ErrorFactory.notFound('User not found');
 * throw ErrorFactory.validation('Invalid email');
 */
export class ErrorFactory {
  /**
   * Create a NotFoundError (404)
   */
  static notFound(message: string): NotFoundError {
    return new NotFoundError(message);
  }

  /**
   * Create a ValidationError (400)
   */
  static validation(message: string): ValidationError {
    return new ValidationError(message);
  }

  /**
   * Create an UnauthorizedError (401)
   */
  static unauthorized(message: string): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  /**
   * Create a ForbiddenError (403)
   */
  static forbidden(message: string): ForbiddenError {
    return new ForbiddenError(message);
  }

  /**
   * Create a ConflictError (409)
   */
  static conflict(message: string): ConflictError {
    return new ConflictError(message);
  }

  /**
   * Create a DatabaseError (500)
   */
  static database(message: string): DatabaseError {
    return new DatabaseError(message);
  }
}
