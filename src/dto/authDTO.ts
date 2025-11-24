import { z } from 'zod';

export const CreateAuthSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(
            /[A-Z]/,
            'Password must contain at least one upper case character',
        )
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(
            /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/,
            'Password must contain at least one special character',
        ),
    passwordLastModificationTime: z
        .date()
        .max(new Date(), 'Password modification date cannot be in the future')
        .optional()
        .nullable(),

});

export const UpdateAuthSchema = CreateAuthSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least 1 field is required' },
);

export type CreateAuthDTO = z.infer<typeof CreateAuthSchema>;
export type UpdateAuthDTO = z.infer<typeof UpdateAuthSchema>;

export interface AuthResponseDto {
    id: string;
    userId: string;
    passwordLastModificationTime: Date | null;
}
