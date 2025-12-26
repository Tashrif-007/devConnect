import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { CommentService } from '../services/commentService';
import { ResponseFormatter } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { COMMENT_RESPONSE_MESSAGES } from '../constants/messages';
import type { authenticatedRequest } from '../middlewares/authentication';

@injectable()
export class CommentController {
    constructor(private commentService: CommentService) {}

    createComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const { storyId } = req.params;
            const { body } = req.body;

            const result = await this.commentService.createComment(
                userId!,
                storyId,
                body,
            );

            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(
                    result,
                    COMMENT_RESPONSE_MESSAGES.COMMENT_CREATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getCommentsByStory = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { storyId } = req.params;
            const { page = 1, itemsPerPage = 10 } = req.query;

            const result = await this.commentService.getCommentsByStory(
                storyId,
                Number(page),
                Number(itemsPerPage),
            );

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    COMMENT_RESPONSE_MESSAGES.COMMENTS_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getCommentById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { commentId } = req.params;

            const result = await this.commentService.getCommentById(commentId);

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    COMMENT_RESPONSE_MESSAGES.COMMENTS_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    updateComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const { commentId } = req.params;
            const { body } = req.body;

            const result = await this.commentService.updateComment(
                commentId,
                userId!,
                body,
            );

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    COMMENT_RESPONSE_MESSAGES.COMMENT_UPDATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const { commentId } = req.params;

            await this.commentService.deleteComment(commentId, userId!);

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    { commentId },
                    COMMENT_RESPONSE_MESSAGES.COMMENT_DELETED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };
}
