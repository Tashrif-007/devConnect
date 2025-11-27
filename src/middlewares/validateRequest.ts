import { ZodType, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ErrorFactory } from '../errors/errorFactory';

type RequestProperty = 'body' | 'params' | 'query';

const validateRequest = (schema: ZodType, property: RequestProperty) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[property]);

        if (!result.success) {
            const errorMessages = result.error.issues
                .map(
                    (issue: ZodIssue) =>
                        `${issue.path.join('.')}: ${issue.message}`,
                )
                .join(', ');

            return next(ErrorFactory.validation(errorMessages));
        }

        if (property === 'query') {
            const path = req.url.split('?')[0];
            const queryString = new URLSearchParams(
                result.data as Record<string, string>,
            ).toString();
            req.url = queryString ? `${path}?${queryString}` : path;
        } else {
            req[property] = result.data;
        }
        next();
    };
};

export const validateRequestBody = (schema: ZodType) => {
    return validateRequest(schema, 'body');
};

export const validateRequestParams = (schema: ZodType) => {
    return validateRequest(schema, 'params');
};

export const validateRequestQuery = (schema: ZodType) => {
    return validateRequest(schema, 'query');
};
