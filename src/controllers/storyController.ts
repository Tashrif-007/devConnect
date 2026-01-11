import { NextFunction, Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import {
    STORY_RESPONSE_MESSAGES,
    SUMMARY_RESPONSE_MESSAGES,
} from '../constants/messages';
import { CreateStoryDTO, StoryResponseDTO } from '../dto/storyDTO';
import { PaginatedResponseDTO, PaginationQuery } from '../dto/paginationDTO';
import { authenticatedRequest } from '../middlewares/authentication';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

@injectable()
export class StoryController {
    constructor(private storyService: StoryService) {}

    createStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const storyData: CreateStoryDTO = req.body;
            const decoded = (req as authenticatedRequest).decoded;
            storyData.userId = decoded!.userId;
            const story = await this.storyService.createStory(
                storyData,
                decoded!.userId,
            );
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
            const paginationQuery: PaginationQuery =
                req.query as unknown as PaginationQuery;
            const userId = (req as authenticatedRequest).decoded?.userId;
            const result: PaginatedResponseDTO<StoryResponseDTO> =
                await this.storyService.getAllStories(paginationQuery, userId);
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
            const userId = (req as authenticatedRequest).decoded?.userId;
            const story: StoryResponseDTO =
                await this.storyService.getStoryById(
                    req.params.storyId,
                    userId,
                );
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

    getStoriesByUserId = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.params.userId;
            const result: PaginatedResponseDTO<StoryResponseDTO> =
                await this.storyService.getStoriesByUserId(userId);
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

    updateStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const story: StoryResponseDTO = await this.storyService.updateStory(
                req.params.storyId,
                req.body,
                userId,
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

    regenerateSummary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const story = await this.storyService.regenerateSummary(
                req.params.storyId,
                userId,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    story,
                    SUMMARY_RESPONSE_MESSAGES.CREATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };
}
