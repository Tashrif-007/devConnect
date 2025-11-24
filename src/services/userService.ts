import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO, UserResponseDto } from '../dto/userDTO';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { mapUserToResponseDto } from '../utils/userMapper';
import { ConflictError, NotFoundError } from '../errors/errors';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserDTO): Promise<UserResponseDto> {
    const existingUserByUsername: User | null = await this.userRepository.findByUsername(
      userData.username,
    );
    if (existingUserByUsername) {
      throw new ConflictError(USER_RESPONSE_MESSAGES.USERNAME_EXISTS);
    }

    const existingUserByEmail: User | null = await this.userRepository.findByEmail(
      userData.email,
    );
    if (existingUserByEmail) {
      throw new ConflictError(USER_RESPONSE_MESSAGES.EMAIL_EXISTS);
    }

    const user: User = await this.userRepository.create(userData);
    return mapUserToResponseDto(user);
  }
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users: User[] = await this.userRepository.findAll();
    return users.map((user) => mapUserToResponseDto(user));
  }
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user: User | null = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
    }
    return mapUserToResponseDto(user);
  }
  async updateUser(userId: string, userData: UpdateUserDTO): Promise<UserResponseDto> {
    const user: User | null = await this.userRepository.update(userId, userData);
    if (!user) {
      throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
    }
    return mapUserToResponseDto(user);
  }
  async deleteUser(userId: string): Promise<void> {
    const result: UpdateResult = await this.userRepository.softDelete(userId);
    if (!result.affected || result.affected === 0) {
      throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
    }
  }
}
