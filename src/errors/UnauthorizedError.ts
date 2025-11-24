import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

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
