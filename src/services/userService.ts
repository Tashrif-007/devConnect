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

    async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
        const existingUserByUsername = await this.userRepository.findByUsername(
            userData.username,
        );
        if (existingUserByUsername) {
            throw ErrorFactory.conflict(USER_RESPONSE_MESSAGES.USERNAME_EXISTS);
        }

        const existingUserByEmail = await this.userRepository.findByEmail(
            userData.email,
        );
        if (existingUserByEmail) {
            throw ErrorFactory.conflict(USER_RESPONSE_MESSAGES.EMAIL_EXISTS);
        }

        const user = await this.userRepository.create(userData);
        return UserResponseDTO.fromEntity(user);
    }
    async getAllUsers(): Promise<UserResponseDTO[]> {
        const users = await this.userRepository.findAll();
        return UserResponseDTO.fromEntities(users);
    }
    async getUserById(userId: string): Promise<UserResponseDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw ErrorFactory.notFound(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return UserResponseDTO.fromEntity(user);
    }
    async updateUser(
        userId: string,
        userData: UpdateUserDTO,
    ): Promise<UserResponseDTO> {
        const user = await this.userRepository.update(userId, userData);
        if (!user) {
            throw ErrorFactory.notFound(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return UserResponseDTO.fromEntity(user);
    }
    async deleteUser(userId: string): Promise<void> {
        const result = await this.userRepository.softDelete(userId);
        if (!result.affected) {
            throw ErrorFactory.notFound(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}
