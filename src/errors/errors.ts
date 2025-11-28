import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

/**
 * Base custom error class for application errors
 *
 * @example
 * throw new AppError('Something went wrong', 500);
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * NotFoundError - Used when a requested resource is not found
 * Returns HTTP 404 status code
 *
 * @example
 * throw new NotFoundError('User not found');
 */
export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * ValidationError - Used when request validation fails
 * Returns HTTP 400 status code
 *
 * @example
 * throw new ValidationError('Invalid email format');
 */
export class ValidationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_FAILED) {
    super(message, HttpStatus.BAD_REQUEST);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * UnauthorizedError - Used when authentication is required or fails
 * Returns HTTP 401 status code
 *
 * @example
 * throw new UnauthorizedError('Invalid credentials');
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * ForbiddenError - Used when user lacks permission to access resource
 * Returns HTTP 403 status code
 *
 * @example
 * throw new ForbiddenError('You do not have permission to perform this action');
 */
export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.ACCESS_FORBIDDEN) {
    super(message, HttpStatus.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * ConflictError - Used when a resource conflict occurs (e.g., duplicate entry)
 * Returns HTTP 409 status code
 *
 * @example
 * throw new ConflictError('Username already exists');
 */
export class ConflictError extends AppError {
  constructor(message: string = ERROR_MESSAGES.CONFLICT) {
    super(message, HttpStatus.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * DatabaseError - Used when database operations fail
 * Returns HTTP 500 status code
 *
 * @example
 * throw new DatabaseError('Failed to connect to database');
 */
export class DatabaseError extends AppError {
  constructor(message: string = ERROR_MESSAGES.DATABASE_FAILED) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
