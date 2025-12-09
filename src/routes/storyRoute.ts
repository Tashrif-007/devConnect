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
import { authentication } from '../middlewares/authentication';
import {
    checkRequiredRoles,
    storyUpdateDeleteAuthorization,
} from '../middlewares/authorization';
import { UserRole } from '../enums';

const storyRouter = express.Router();
const storyController = new StoryController();

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
    storyController.getAllStories,
);
storyRouter.get(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
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

export default storyRouter;
