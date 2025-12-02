import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { AppError, ValidationError, DatabaseError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { ResponseFormatter } from '../utils/apiResponse';
import { envValues } from '../utils/envParser';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isDevelopment = envValues.NODE_ENV === "development";

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((issue: ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    const validationError = new ValidationError(
      ERROR_MESSAGES.VALIDATION_FAILED,
    );

    const response = {
      ...ResponseFormatter.error(validationError.message),
      errors: validationErrors,
      ...(isDevelopment && { stack: err.stack }),
    };

    return res.status(validationError.statusCode).json(response);
  }

  if (err instanceof AppError) {
    const response = {
      ...ResponseFormatter.error(err.message),
      ...(isDevelopment && { stack: err.stack }),
    };

    return res.status(err.statusCode).json(response);
  }

  if (err.name === 'QueryFailedError') {
    const dbError = new DatabaseError(ERROR_MESSAGES.DATABASE_FAILED);

    const response = {
      ...ResponseFormatter.error(dbError.message),
      ...(isDevelopment && { stack: err.stack }),
    };

    return res.status(dbError.statusCode).json(response);
  }

  const response = {
    ...ResponseFormatter.error(ERROR_MESSAGES.SERVER_ERROR),
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack,
    }),
  };

  return res.status(500).json(response);
};
