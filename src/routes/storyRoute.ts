import express from 'express';
import { StoryController } from '../controllers/storyController';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
import {
    CreateStorySchema,
    UpdateStorySchema,
    StoryIdParamSchema,
} from '../dto/storyDTO';
import { PaginationQuerySchema } from '../dto/paginationDTO';
import {
    authentication,
    optionalAuthentication,
} from '../middlewares/authentication';
import {
    checkRequiredRoles,
    storyUpdateDeleteAuthorization,
} from '../middlewares/authorization';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { UserRole } from '../enums';
import { container } from 'tsyringe';

const storyRouter = express.Router();
const storyController = container.resolve(StoryController);

storyRouter.post(
    '/',
    writeLimiter,
    validateRequestBody(CreateStorySchema),
    authentication(),
    checkRequiredRoles([UserRole.USER, UserRole.ADMIN]),
    storyController.createStory,
);
storyRouter.get(
    '/',
    readLimiter,
    validateRequestQuery(PaginationQuerySchema),
    optionalAuthentication(),
    storyController.getAllStories,
);
storyRouter.get(
    '/user/:userId',
    readLimiter,
    optionalAuthentication(),
    storyController.getStoriesByUserId,
);
storyRouter.get(
    '/:storyId',
    readLimiter,
    validateRequestParams(StoryIdParamSchema),
    optionalAuthentication(),
    storyController.getStoryById,
);
storyRouter.put(
    '/:storyId',
    writeLimiter,
    validateRequestParams(StoryIdParamSchema),
    validateRequestBody(UpdateStorySchema),
    authentication(),
    storyUpdateDeleteAuthorization(),
    storyController.updateStory,
);
storyRouter.delete(
    '/:storyId',
    writeLimiter,
    validateRequestParams(StoryIdParamSchema),
    authentication(),
    storyUpdateDeleteAuthorization(),
    storyController.deleteStory,
);

storyRouter.post(
    '/:storyId/regenerate-summary',
    writeLimiter,
    validateRequestParams(StoryIdParamSchema),
    authentication(),
    checkRequiredRoles([UserRole.USER, UserRole.ADMIN]),
    storyController.regenerateSummary,
);

export default storyRouter;
