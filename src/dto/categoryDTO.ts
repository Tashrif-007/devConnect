import { Exclude, Expose } from 'class-transformer';
import z from 'zod';
import { BaseResponseDTO } from './baseDTO';

export const CategorySchema = z
    .object({
        name: z
            .string({ message: 'name is required' })
            .trim()
            .max(30, 'name cannot exceed 30 characters'),
        description: z
            .string()
            .trim()
            .max(100, 'description cannot exceed 100 characters')
            .optional(),
    })
    .strict();

export const CategoryIdSchema = z.object({
    categoryId: z.uuidv4('Invalid story ID format'),
});

export type CategoryDTO = z.infer<typeof CategorySchema>;

@Exclude()
export class CategoryResponseDTO extends BaseResponseDTO {
    @Expose()
    categoryId: string;

    @Expose()
    name: string;

    @Expose()
    description?: string;

    @Expose()
    createdAt: Date;
}
