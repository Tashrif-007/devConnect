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
import { UserRole } from '../enums';
import { container } from 'tsyringe';

const storyRouter = express.Router();
const storyController = container.resolve(StoryController);

storyRouter.post(
    '/',
    validateRequestBody(CreateStorySchema),
    authentication(),
    checkRequiredRoles([UserRole.USER, UserRole.ADMIN]),
    storyController.createStory,
);
storyRouter.get(
    '/',
    validateRequestQuery(PaginationQuerySchema),
    optionalAuthentication(),
    storyController.getAllStories,
);
storyRouter.get(
    '/user/:userId',
    optionalAuthentication(),
    storyController.getStoriesByUserId,
);
storyRouter.get(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    optionalAuthentication(),
    storyController.getStoryById,
);
storyRouter.put(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    validateRequestBody(UpdateStorySchema),
    authentication(),
    storyUpdateDeleteAuthorization(),
    storyController.updateStory,
);
storyRouter.delete(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    authentication(),
    storyUpdateDeleteAuthorization(),
    storyController.deleteStory,
);

storyRouter.post(
    '/:storyId/regenerate-summary',
    validateRequestParams(StoryIdParamSchema),
    authentication(),
    checkRequiredRoles([UserRole.USER]),
    storyController.regenerateSummary,
);

export default storyRouter;
