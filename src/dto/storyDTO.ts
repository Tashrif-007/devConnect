import { z } from 'zod';
import { Exclude, Expose, Type } from 'class-transformer';
import { BaseResponseDTO } from './baseDTO';
import { PaginationMeta } from './paginationDTO';

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
    userId: z.uuidv4('Invalid user ID format'),
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
    userId: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    @Type(() => Object)
    pagination?: PaginationMeta;
}
