import express from 'express';
import { container } from 'tsyringe';
import { CommentController } from '../controllers/commentController';
import { authentication } from '../middlewares/authentication';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
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
    authentication(),
    validateRequestBody(CreateCommentSchema),
    commentController.createComment,
);

commentRouter.get(
    '/:storyId/comments',
    validateRequestQuery(PaginationQuerySchema),
    commentController.getCommentsByStory,
);

commentRouter.get(
    '/comments/:commentId',
    validateRequestParams(CommentIdParamSchema),
    commentController.getCommentById,
);

commentRouter.patch(
    '/comments/:commentId',
    authentication(),
    validateRequestParams(CommentIdParamSchema),
    validateRequestBody(UpdateCommentSchema),
    commentController.updateComment,
);

commentRouter.delete(
    '/comments/:commentId',
    authentication(),
    validateRequestParams(CommentIdParamSchema),
    commentController.deleteComment,
);

export default commentRouter;
