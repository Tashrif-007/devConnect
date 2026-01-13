import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/errors';

export const routeNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(
    new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`),
  );
};
