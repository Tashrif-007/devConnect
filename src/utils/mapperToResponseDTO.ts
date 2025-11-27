import { User } from '../entity/userEntity';
import { UserResponseDto } from '../dto/userDTO';

export const mapUserToResponseDto = (user: User): UserResponseDto => {
  return {
    id: user.userId,
    username: user.username,
    name: user.name,
    email: user.email,
    joinDate: user.joinDate,
    role: user.role,
  };
};
