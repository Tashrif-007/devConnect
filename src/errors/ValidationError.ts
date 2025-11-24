import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';

/**
 * ValidationError - Used when request validation fails
 * Returns HTTP 400 status code
 * 
 * @example
 * throw new ValidationError('Invalid email format');
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
