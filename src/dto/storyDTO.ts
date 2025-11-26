import { z } from 'zod';

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

export const UpdateStorySchema = CreateStorySchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required for update' },
);

export const StoryIdParamSchema = z.object({
    storyId: z.uuidv4('Invalid story ID format'),
});

export type CreateStoryDTO = z.infer<typeof CreateStorySchema>;
export type UpdateStoryDTO = z.infer<typeof UpdateStorySchema>;
export type StoryIdParam = z.infer<typeof StoryIdParamSchema>;

export interface StoryResponseDTO {
    storyId: string;
    title: string;
    body: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
