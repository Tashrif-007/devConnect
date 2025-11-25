import { Request, Response, NextFunction } from 'express';
import { ErrorFactory } from '../errors';

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
    ErrorFactory.notFound(`Route not found: ${req.method} ${req.originalUrl}`),
  );
};
