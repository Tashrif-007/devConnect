import { jwtPayload } from '../dto/authDTO';
import jwt from 'jsonwebtoken';
import { envValues } from './envParser';
import { UnauthorizedError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';

const jwtSecret = envValues.JWT_SECRET!;
const jwtExpiry = envValues.JWT_EXPIRY!;

export const signToken = (jwtPayload: jwtPayload): string => {
    return jwt.sign(jwtPayload, jwtSecret, { expiresIn: '30d' });
};

export const verifyToken = (token: string): jwtPayload => {
    try {
        return jwt.verify(token, jwtSecret) as jwtPayload;
    } catch (error) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
    }
};

interface EmailConfirmationPayload {
    userId: string;
}

export const signEmailConfirmationToken = (userId: string): string => {
    const payload: EmailConfirmationPayload = { userId };
    return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

export const verifyEmailConfirmationToken = (token: string): string => {
    try {
        const decoded = jwt.verify(
            token,
            jwtSecret,
        ) as EmailConfirmationPayload;
        return decoded.userId;
    } catch (error) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
    }
};
