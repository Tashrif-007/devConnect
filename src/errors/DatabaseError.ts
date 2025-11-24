import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

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
