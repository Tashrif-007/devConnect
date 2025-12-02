import { NextFunction, Request, Response } from 'express';
import { authenticatedRequest } from './authentication';
import { ForbiddenError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { StoryService } from '../services/storyService';

const allowedRoles = ['ADMIN', 'USER'];

export const creationAuthorization = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const decoded = (req as authenticatedRequest).decoded;

            if (allowedRoles.includes(decoded!.role)) {
                return next();
            }
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        } catch (error) {
            next(error);
        }
    };
};

export const updateDeleteAuthorization = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requestedUserId = req.params.storyId;
            const storyService = new StoryService();
            const story = await storyService.getStoryById(requestedUserId);
            const userId = story.userId;

            if (userId === (req as authenticatedRequest).decoded?.userId) {
                return next();
            }
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        } catch (error) {
            next(error);
        }
    };
};

export const userAuthorization = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const decoded = (req as authenticatedRequest).decoded;
            if (allowedRoles.includes(decoded!.role)) {
                return next();
            }
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        } catch (error) {
            next(error);
        }
    };
};
