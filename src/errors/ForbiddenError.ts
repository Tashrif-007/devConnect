import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

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
