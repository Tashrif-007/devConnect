import { User, UserRole } from '../entity/userEntity';

export interface CreateUserDto {
  username: string;
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  username?: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: string;
  username: string;
  name: string;
  email: string;
  joinDate: Date;
  role: UserRole;
}
