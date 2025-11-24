import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

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
