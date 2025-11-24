import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * DatabaseError - Used when database operations fail
 * Returns HTTP 500 status code
 * 
 * @example
 * throw new DatabaseError('Failed to connect to database');
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', isOperational: boolean = true) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, isOperational);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
