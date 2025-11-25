import { Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { STORY_RESPONSE_MESSAGES, USER_RESPONSE_MESSAGES } from '../constants/messages';
import { CreateStoryDto } from '../dto/storyDTO';

export class StoryController {
    private storyService: StoryService;

    constructor() {
        this.storyService = new StoryService();
    }

    createStory = async (req: Request, res: Response) => {
        try {
            const storyData: CreateStoryDto = req.body;
            const story = await this.storyService.createStory(storyData);
            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(
                    story,
                    STORY_RESPONSE_MESSAGES.CREATED,
                ),
            );
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json(
                ResponseFormatter.error(STORY_RESPONSE_MESSAGES.CREATION_FAILED),
            );
        }
    };
}
