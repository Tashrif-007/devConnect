import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { VALIDATION_MESSAGES } from '../constants/messages';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if(!result.success) {
      return res.status(HttpStatus.BAD_REQUEST).json(ResponseFormatter.error(VALIDATION_MESSAGES.VALIDATION_FAILED));
    }
    req.body = result.data;
    next();
  };
};
