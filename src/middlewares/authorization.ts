import { NextFunction, Request, Response } from 'express';
import { authenticatedRequest } from './authentication';
import { ForbiddenError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import { StoryService } from '../services/storyService';
import { AuthService } from '../services/authService';
import { UserRole } from '../enums';
import { container } from '../container';

export const checkRequiredRoles = (allowedRoles: UserRole[]) => {
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

export const baseUpdateDeleteAuthorization = (
    paramName: string,
    getResourceOwnerIdFn: (resourceId: string) => Promise<string>,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params[paramName];
            const resourceOwnerId = await getResourceOwnerIdFn(resourceId);
            const authenticatedUserId = (req as authenticatedRequest).decoded
                ?.userId;

            if (resourceOwnerId === authenticatedUserId) {
                return next();
            }
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        } catch (error) {
            next(error);
        }
    };
};

export const storyUpdateDeleteAuthorization = () => {
    return baseUpdateDeleteAuthorization('storyId', async (storyId: string) => {
        const storyService = container.resolve(StoryService);
        const story = await storyService.getStoryById(storyId);
        return story.userId;
    });
};

export const userUpdateDeleteAuthorization = () => {
    return baseUpdateDeleteAuthorization('userId', async (userId: string) => {
        return userId;
    });
};

export const updateAuthAuthorization = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authenticatedUserId = (req as authenticatedRequest).decoded
                ?.userId;

            const authService = container.resolve(AuthService);
            const authExists = await authService.verifyUserAuthExists(
                authenticatedUserId!,
            );

            if (!authExists) {
                throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
            }
            return next();
        } catch (error) {
            next(error);
        }
    };
};

export const updateDeleteAuthorization = storyUpdateDeleteAuthorization;
