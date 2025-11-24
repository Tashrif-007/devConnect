import { z } from 'zod';

export const CreateAuthSchema = z.object({
<<<<<<< HEAD
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
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
=======
  password: z.string().trim().min(8, 'Password must be at least 8 characters').max(128),
  userId: z.string().trim().uuid('Invalid user ID format'),
});

export const UpdateAuthSchema = z.object({
  password: z.string().trim().min(8, 'Password must be at least 8 characters').max(128).optional(),
});
>>>>>>> b43beb9 (fix: use messages in controller, safeParse in validation and trimming)

export type CreateAuthDTO = z.infer<typeof CreateAuthSchema>;
export type UpdateAuthDTO = z.infer<typeof UpdateAuthSchema>;

export interface AuthResponseDto {
  id: string;
  userId: string;
  passwordLastModificationTime: Date | null;
}
