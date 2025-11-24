import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

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
