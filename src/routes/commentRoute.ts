import express from 'express';
import { container } from 'tsyringe';
import { CommentController } from '../controllers/commentController';
import { authentication } from '../middlewares/authentication';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import {
    CreateCommentSchema,
    UpdateCommentSchema,
    CommentIdParamSchema,
    PaginationQuerySchema,
} from '../dto/commentDTO';

const commentRouter = express.Router();
const commentController = container.resolve(CommentController);

commentRouter.post(
    '/:storyId/comments',
    writeLimiter,
    authentication(),
    validateRequestBody(CreateCommentSchema),
    commentController.createComment,
);

commentRouter.get(
    '/:storyId/comments',
    readLimiter,
    validateRequestQuery(PaginationQuerySchema),
    commentController.getCommentsByStory,
);

commentRouter.get(
    '/comments/:commentId',
    readLimiter,
    validateRequestParams(CommentIdParamSchema),
    commentController.getCommentById,
);

commentRouter.patch(
    '/comments/:commentId',
    writeLimiter,
    authentication(),
    validateRequestParams(CommentIdParamSchema),
    validateRequestBody(UpdateCommentSchema),
    commentController.updateComment,
);

commentRouter.delete(
    '/comments/:commentId',
    writeLimiter,
    authentication(),
    validateRequestParams(CommentIdParamSchema),
    commentController.deleteComment,
);

export default commentRouter;
