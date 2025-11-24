import { z } from 'zod';

export const CreateAuthSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  userId: z.uuid('Invalid user ID format'),
});

export const UpdateAuthSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .optional(),
});

export type CreateAuthDTO = z.infer<typeof CreateAuthSchema>;
export type UpdateAuthDTO = z.infer<typeof UpdateAuthSchema>;

export interface AuthResponseDto {
  id: string;
  userId: string;
  passwordLastModificationTime: Date | null;
}
