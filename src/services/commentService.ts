import { injectable } from 'tsyringe';
import { CommentRepository } from '../repositories/commentRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { CommentResponseDTO, CommentsPageResponseDTO } from '../dto/commentDTO';
import { NotFoundError, ForbiddenError } from '../errors/errors';
import {
    COMMENT_RESPONSE_MESSAGES,
    ERROR_MESSAGES,
} from '../constants/messages';

@injectable()
export class CommentService {
    constructor(
        private commentRepository: CommentRepository,
        private storyRepository: StoryRepository,
    ) {}

    async createComment(
        userId: string,
        storyId: string,
        body: string,
    ): Promise<CommentResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const comment = await this.commentRepository.create(
            userId,
            storyId,
            body,
        );
        const populatedComment = await this.commentRepository.findById(
            comment.commentId,
        );

        return CommentResponseDTO.fromEntity(populatedComment);
    }

    async getCommentsByStory(
        storyId: string,
        page: number = 1,
        itemsPerPage: number = 10,
    ): Promise<CommentsPageResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        const [comments, total] = await this.commentRepository.findByStory(
            storyId,
            page,
            itemsPerPage,
        );

        const data = CommentResponseDTO.fromEntities(comments);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / itemsPerPage),
                totalItems: total,
                itemsPerPage,
            },
        };
    }

    async getCommentsByStoryOnly(
        storyId: string,
        page: number = 1,
        itemsPerPage: number = 10,
    ): Promise<CommentResponseDTO[]> {
        const [comments] = await this.commentRepository.findByStory(
            storyId,
            page,
            itemsPerPage,
        );

        return CommentResponseDTO.fromEntities(comments);
    }

    async getCommentById(commentId: string): Promise<CommentResponseDTO> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new NotFoundError(
                COMMENT_RESPONSE_MESSAGES.COMMENT_NOT_FOUND,
            );
        }

        return CommentResponseDTO.fromEntity(comment);
    }

    async updateComment(
        commentId: string,
        userId: string,
        body: string,
    ): Promise<CommentResponseDTO> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new NotFoundError(
                COMMENT_RESPONSE_MESSAGES.COMMENT_NOT_FOUND,
            );
        }
        if (comment.userId !== userId) {
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        }
        const updatedComment = await this.commentRepository.update(
            commentId,
            body,
        );

        return CommentResponseDTO.fromEntity(updatedComment);
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = await this.commentRepository.findById(commentId);
        if (!comment) {
            throw new NotFoundError(
                COMMENT_RESPONSE_MESSAGES.COMMENT_NOT_FOUND,
            );
        }
        if (comment.userId !== userId) {
            throw new ForbiddenError(ERROR_MESSAGES.ACCESS_FORBIDDEN);
        }
        await this.commentRepository.softDelete(commentId);
    }
}
