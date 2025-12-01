import { NextFunction, Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { STORY_RESPONSE_MESSAGES } from '../constants/messages';
import { CreateStoryDTO, StoryResponseDTO } from '../dto/storyDTO';
import { PaginationRequestDTO } from '../dto/paginationDTO';

export class StoryController {
    private storyService: StoryService;

    constructor() {
        this.storyService = new StoryService();
    }

    createStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const storyData: CreateStoryDTO = req.body;
            const story = await this.storyService.createStory(storyData);
            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(
                    story,
                    STORY_RESPONSE_MESSAGES.CREATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getAllStories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paginationDTO: PaginationRequestDTO = {
                page: parseInt(req.query.page as string),
                itemsPerPage: parseInt(req.query.itemsPerPage as string),
                searchTerm: req.query.find as string | undefined,
            };
            const result = await this.storyService.getAllStories(paginationDTO);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    STORY_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getStoryById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const story: StoryResponseDTO =
                await this.storyService.getStoryById(req.params.storyId);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    story,
                    STORY_RESPONSE_MESSAGES.RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    updateStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const story: StoryResponseDTO = await this.storyService.updateStory(
                req.params.storyId,
                req.body,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    story,
                    STORY_RESPONSE_MESSAGES.UPDATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    deleteStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.storyService.deleteStory(req.params.storyId);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(STORY_RESPONSE_MESSAGES.DELETED),
            );
        } catch (error) {
            next(error);
        }
    };
}
