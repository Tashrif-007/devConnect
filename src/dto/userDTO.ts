import { z } from 'zod';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../enums/index';
import { BaseResponseDTO } from './baseDTO';
import { PaginationMeta } from './paginationDTO';

export const CreateUserSchema = z
    .object({
        username: z
            .string({ message: 'Username is required' })
            .trim()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters'),
        name: z
            .string({ message: 'Name is required' })
            .trim()
            .min(1, 'Name cannot be empty')
            .max(100, 'Name must not exceed 100 characters'),
        email: z
            .email({ message: 'Invalid email format' })
            .trim()
            .min(1, 'Email is required'),
        role: z.enum(UserRole).optional(),
    })
    .strict();

export const UpdateUserSchema = CreateUserSchema.omit({username: true, email: true}).partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required for update' },
);

export const UserIdParamSchema = z.object({
    userId: z.uuidv4('Invalid user ID format'),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;

@Exclude()
export class UserResponseDTO extends BaseResponseDTO {
    @Expose()
    userId: string;

    @Expose()
    username: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    joinDate: Date;

    @Expose()
    role: UserRole;

    @Expose()
    @Type(() => Object)
    pagination?: PaginationMeta;
}
