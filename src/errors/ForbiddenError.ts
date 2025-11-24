import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * ForbiddenError - Used when user lacks permission to access resource
 * Returns HTTP 403 status code
 * 
 * @example
 * throw new ForbiddenError('You do not have permission to perform this action');
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
