/**
 * Custom Error Classes
 * 
 * Usage Patterns:
 * 
 * 1. Direct instantiation:
 *    throw new NotFoundError('User not found');
 * 
 * 2. Using ErrorFactory:
 *    throw ErrorFactory.notFound('User not found');
 * 
 * 3. In async functions with try-catch:
 *    try {
 *      const user = await findUser(id);
 *      if (!user) throw new NotFoundError('User not found');
 *    } catch (error) {
 *      next(error); // Pass to error handler
 *    }
 * 
 * 4. With next() in Express middleware:
 *    if (!user) return next(new NotFoundError('User not found'));
 */

export { AppError } from './AppError';
export { NotFoundError } from './NotFoundError';
export { ValidationError } from './ValidationError';
export { UnauthorizedError } from './UnauthorizedError';
export { ForbiddenError } from './ForbiddenError';
export { DatabaseError } from './DatabaseError';
export { ErrorFactory } from './errorFactory';
