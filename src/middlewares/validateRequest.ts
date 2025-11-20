import { ZodError, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES, VALIDATION_MESSAGES } from '../constants/messages';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(ResponseFormatter.error(VALIDATION_MESSAGES.VALIDATION_FAILED));
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseFormatter.error(VALIDATION_MESSAGES.SERVER_ERROR));
    }
  };
};
