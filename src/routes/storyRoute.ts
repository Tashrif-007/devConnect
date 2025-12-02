import express from 'express';
import { StoryController } from '../controllers/storyController';
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/validateRequest';
import {
    CreateStorySchema,
    UpdateStorySchema,
    StoryIdParamSchema,
} from '../dto/storyDTO';

const storyRouter = express.Router();
const storyController = new StoryController();

storyRouter.post(
    '/',
    validateRequestBody(CreateStorySchema),
    storyController.createStory,
);
storyRouter.get('/', storyController.getAllStories);
storyRouter.get(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    storyController.getStoryById,
);
storyRouter.put(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    validateRequestBody(UpdateStorySchema),
    storyController.updateStory,
);
storyRouter.delete(
    '/:storyId',
    validateRequestParams(StoryIdParamSchema),
    storyController.deleteStory,
);

export default storyRouter;
