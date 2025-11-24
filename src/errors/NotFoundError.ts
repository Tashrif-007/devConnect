import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * NotFoundError - Used when a requested resource is not found
 * Returns HTTP 404 status code
 * 
 * @example
 * throw new NotFoundError('User not found');
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
