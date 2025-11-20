import { User, UserRole } from '../entity/userEntity';

export class CreateUserDto {
  username: string;
  name: string;
  email: string;
  role?: UserRole;
}

export class UpdateUserDto {
  username?: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export class UserResponseDto {
  id: string;
  username: string;
  name: string;
  email: string;
  joinDate: Date;
  role: UserRole;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.name = user.name;
    dto.email = user.email;
    dto.joinDate = user.joinDate;
    dto.role = user.role;
    return dto;
  }
}
