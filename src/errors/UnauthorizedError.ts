import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * UnauthorizedError - Used when authentication is required or fails
 * Returns HTTP 401 status code
 * 
 * @example
 * throw new UnauthorizedError('Invalid credentials');
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
