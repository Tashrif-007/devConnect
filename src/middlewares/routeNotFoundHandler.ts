import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/errors';

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
    new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`),
  );
};
