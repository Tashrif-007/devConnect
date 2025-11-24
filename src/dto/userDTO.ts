import { z } from 'zod';
import { UserRole } from '../entity/userEntity';

export const CreateUserSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.email('Invalid email format'),
  role: z.enum(UserRole).optional(),
});

// export const UpdateUserSchema = z.object({
//   username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50).optional(),
//   name: z.string().trim().min(1, 'Name is required').max(100).optional(),
//   email: z.string().trim().email('Invalid email format').optional(),
//   role: z.enum(UserRole).optional(),
// });

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

export interface UserResponseDto {
  id: string;
  username: string;
  name: string;
  email: string;
  joinDate: Date;
  role: UserRole;
}
