import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import jwt from 'jsonwebtoken';
import { envValues } from '../utils/envParser';
import { jwtPayload } from '../dto/authDTO';

export interface authenticatedRequest extends Request {
    decoded?: jwtPayload;
}

export const authentication = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            const jwtSecret = envValues.JWT_SECRET;

            if (!authHeader) {
                throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length !== 2 && tokenParts[0] !== 'Bearer') {
                throw new UnauthorizedError(ERROR_MESSAGES.INVALID_HEADER);
            }
            const token = tokenParts[1];
            if (!token) {
                throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING);
            }

            const decoded = jwt.verify(
                token,
                jwtSecret as string,
            ) as jwtPayload;

            (req as authenticatedRequest).decoded = decoded;
            next();
        } catch (error) {
            next(error);
        }
    };
};
