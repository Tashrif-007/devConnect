import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * ConflictError - Used when a resource conflict occurs (e.g., duplicate entry)
 * Returns HTTP 409 status code
 *
 * @example
 * throw new ConflictError('Username already exists');
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, HttpStatus.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
