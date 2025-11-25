import express from 'express';
import { StoryController } from '../controllers/storyController';
import { validateRequest } from '../middlewares/validateRequest';
import { CreateStorySchema } from '../dto/storyDTO';

const storyRouter = express.Router();
const storyController = new StoryController();

storyRouter.post(
    '/',
    validateRequest(CreateStorySchema),
    storyController.createStory,
);
storyRouter.get('/', storyController.getAllStories);
storyRouter.get('/:storyId', storyController.getStoryById);
storyRouter.put('/:storyId', storyController.updateStory);
storyRouter.delete('/:storyId', storyController.deleteStory);

export default storyRouter;
