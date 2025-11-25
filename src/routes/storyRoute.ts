import express from 'express';
import { StoryController } from '../controllers/storyController';

const storyRouter = express.Router();
const storyController = new StoryController();

storyRouter.post('/', storyController.createStory);

export default storyRouter;