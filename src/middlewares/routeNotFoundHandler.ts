import { Request, Response, NextFunction } from 'express';
<<<<<<< HEAD
import { NotFoundError } from '../errors/errors';
=======
import { ErrorFactory } from '../errors';
>>>>>>> 6f18cd4 (refactor: update to userId, authId, refactor routeNotFoundHandler, add password validation proper message)

/**
 * 404 handler for unmatched routes
 * Must be placed after all route definitions
 */
export const routeNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(
<<<<<<< HEAD
    new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`),
=======
    ErrorFactory.notFound(`Route not found: ${req.method} ${req.originalUrl}`),
>>>>>>> 6f18cd4 (refactor: update to userId, authId, refactor routeNotFoundHandler, add password validation proper message)
  );
};
