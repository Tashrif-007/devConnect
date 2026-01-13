import rateLimit from 'express-rate-limit';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { RATE_LIMIT_MESSAGES } from '../constants/messages';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, _res) => {
        return req.path === '/health';
    },
    handler: (_req, res) => {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json(
            ResponseFormatter.error(
                RATE_LIMIT_MESSAGES.TOO_MANY_REQUESTS,
            ),
        );
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json(
            ResponseFormatter.error(
                RATE_LIMIT_MESSAGES.TOO_MANY_REQUESTS,
            ),
        );
    },
});

export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json(
            ResponseFormatter.error(
                RATE_LIMIT_MESSAGES.TOO_MANY_REQUESTS,
            ),
        );
    },
});

export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
});
