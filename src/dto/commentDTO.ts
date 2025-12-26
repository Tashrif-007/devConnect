import { z } from 'zod';
import { BaseResponseDTO } from './baseDTO';
import { Exclude, Expose, Transform } from 'class-transformer';

export const CreateCommentSchema = z.object({
    body: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const UpdateCommentSchema = z.object({
    body: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const CommentIdParamSchema = z.object({
    commentId: z.string().uuid('Invalid comment ID'),
});

export const StoryIdParamSchema = z.object({
    storyId: z.string().uuid('Invalid story ID'),
});

export const PaginationQuerySchema = z.object({
    page: z.string().optional(),
    itemsPerPage: z.string().optional(),
});

export type CreateCommentPayload = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentPayload = z.infer<typeof UpdateCommentSchema>;
export type CommentIdParam = z.infer<typeof CommentIdParamSchema>;
export type StoryIdParam = z.infer<typeof StoryIdParamSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

@Exclude()
export class CommentResponseDTO extends BaseResponseDTO {
    @Expose()
    commentId: string;

    @Expose()
    body: string;

    @Expose()
    storyId: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    @Transform(({ obj }) => ({
        userId: obj.user?.userId,
        name: obj.user?.name,
        username: obj.user?.username,
        profilePictureUrl: obj.user?.profilePictureUrl,
    }))
    user: {
        userId: string;
        name: string;
        username: string;
        profilePictureUrl: string | null;
    };
}

export class CommentsPageResponseDTO {
    data: CommentResponseDTO[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}
