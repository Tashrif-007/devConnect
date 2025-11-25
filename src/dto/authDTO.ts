import { z } from 'zod';

export const CreateAuthSchema = z.object({
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

export type CreateAuthDTO = z.infer<typeof CreateAuthSchema>;
export type UpdateAuthDTO = z.infer<typeof UpdateAuthSchema>;

export interface AuthResponseDto {
  id: string;
  userId: string;
  passwordLastModificationTime: Date | null;
}
