import { z } from 'zod';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { BaseResponseDTO } from './baseDTO';
import { PaginationMeta } from './paginationDTO';
import { UserResponseDTO } from './userDTO';
import { CommentResponseDTO } from './commentDTO';
import { VoteCountResponseDTO } from './voteDTO';

export const CreateStorySchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Title is required')
        .max(200, 'Title must not exceed 200 characters'),
    body: z
        .string()
        .trim()
        .min(1, 'Body is required')
        .max(5000, 'Body must not exceed 5000 characters'),
    userId: z.uuidv4('Invalid user ID format').optional(),
    categoryIds: z.array(z.uuidv4('Invalid category ID format')).optional(),
    summary: z.string().trim().optional(),
    skip: z.boolean(),
});

export const UpdateStorySchema = CreateStorySchema.omit({ userId: true })
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required for update',
    });

export const StoryIdParamSchema = z.object({
    storyId: z.uuidv4('Invalid story ID format'),
});

export const StorySummarySchema = z.object({
    story: z.string().trim(),
});

export type CreateStoryDTO = z.infer<typeof CreateStorySchema>;
export type UpdateStoryDTO = z.infer<typeof UpdateStorySchema>;
export type StoryIdParam = z.infer<typeof StoryIdParamSchema>;

@Exclude()
export class StoryResponseDTO extends BaseResponseDTO {
    @Expose()
    storyId: string;

    @Expose()
    title: string;

    @Expose()
    body: string;

    @Expose()
    @Type(() => UserResponseDTO)
    user?: UserResponseDTO;

    @Expose()
    userId: string;

    @Expose()
    summary?: string | null;

    @Expose()
    @Transform(
        ({ obj }: { obj: Record<string, unknown> }) =>
            (obj.categories as Array<{ name: string }> | undefined)?.map(
                (cat: { name: string }) => cat.name,
            ) || [],
    )
    categoryNames?: string[];

    @Expose()
    @Type(() => VoteCountResponseDTO)
    votes?: VoteCountResponseDTO;

    @Expose()
    @Type(() => CommentResponseDTO)
    comments?: CommentResponseDTO[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    @Type(() => Object)
    pagination?: PaginationMeta;
}
