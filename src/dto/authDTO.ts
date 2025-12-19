import { z } from 'zod';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../enums/index';
import { BaseResponseDTO } from './baseDTO';
import { JwtPayload } from 'jsonwebtoken';

const passwordSchema = z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one upper case character')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
        /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/,
        'Password must contain at least one special character',
    );

export const SignupSchema = z
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
        password: passwordSchema,
        confirmPassword: z.string({ message: 'Confirm password is required' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .strict();

export const LoginSchema = z
    .object({
        email: z
            .email({ message: 'Invalid email format' })
            .trim()
            .min(1, 'Email is required'),
        password: z
            .string({ message: 'Password is required' })
            .min(1, 'Password is required'),
    })
    .strict();

export const ResendConfirmationEmailSchema = z
    .object({
        email: z
            .email({ message: 'Invalid email format' })
            .trim()
            .min(1, 'Email is required'),
    })
    .strict();

export const UpdateAuthSchema = z.object({
    confirmationCode: z.string().trim().optional(),
    password: z.string().optional(),
    isUsed: z.boolean().optional(),
    userId: z.uuidv4('Invalid user ID format'),
    codeExpiresAt: z.date().optional(),
    passwordLastModificationTime: z.date().optional(),
});

export const ValidateCodeSchema = z.object({
    confirmationCode: z
        .string({ message: 'Confirmation code is required' })
        .trim()
        .min(1, 'Confirmation code is required'),
});

export const UpdatePasswordWithTokenSchema = z.object({
    newPassword: passwordSchema,
    sessionToken: z.string({ message: 'Session token is required' }),
});

export type SignupDTO = z.infer<typeof SignupSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ResendConfirmationEmailDTO = z.infer<
    typeof ResendConfirmationEmailSchema
>;
export type UpdateAuthDTO = z.infer<typeof UpdateAuthSchema>;

export interface authDTO {
    userId: string;
    hashedPassword: string;
}

export interface jwtPayload extends JwtPayload {
    userId: string;
    email: string;
    username: string;
    role: UserRole;
}
export interface LoginResponseDTO {
    token: string;
    user: AuthResponseDTO;
}

export interface EmailConfirmationDTO {
    userId: string;
    username: string;
    email: string;
    subject: string;
    templatePath: string;
    token: string | number;
    confirmationUrl?: string;
}

@Exclude()
export class AuthResponseDTO extends BaseResponseDTO {
    @Expose()
    userId: string;

    @Expose()
    email: string;

    @Expose()
    username: string;

    @Expose()
    name: string;

    @Expose()
    role: UserRole;

    @Expose()
    isEmailConfirmed: boolean;

    @Expose()
    profilePictureUrl?: string;
}
