/**
 * Base custom error class for application errors
 * 
 * @example
 * throw new AppError('Something went wrong', 500);
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
