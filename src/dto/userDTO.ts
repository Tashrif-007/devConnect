import { z } from 'zod';
import { UserRole } from '../entity/userEntity';

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

export const UpdateUserSchema = CreateUserSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required for update' },
);

export const UserIdParamSchema = z.object({
    userId: z.uuidv4('Invalid user ID format'),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;

export interface UserResponseDto {
    userId: string;
    username: string;
    name: string;
    email: string;
    joinDate: Date;
    role: UserRole;
}
