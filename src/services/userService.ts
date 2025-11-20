import { UserRepository } from "../repositories/userRepository";
import { CreateUserDTO, UpdateUserDTO, UserResponseDto } from "../dto/userDTO";
import { USER_RESPONSE_MESSAGES } from "../constants/messages";
import { mapUserToResponseDto } from "../utils/userMapper";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(userData: CreateUserDTO): Promise<UserResponseDto> {
        const user = await this.userRepository.create(userData);
        return mapUserToResponseDto(user);
    }
    async getAllUsers(): Promise<UserResponseDto[]> {
        const users = await this.userRepository.findAll();
        return users.map(user => mapUserToResponseDto(user));
    }
    async getUserById(userId: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return mapUserToResponseDto(user);
    }
    async updateUser(userId: string, userData: UpdateUserDTO): Promise<UserResponseDto> {
        const user = await this.userRepository.update(userId, userData);
        if (!user) {
            throw new Error(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return mapUserToResponseDto(user);
    }
    async deleteUser(userId: string): Promise<void> {
        const result = await this.userRepository.softDelete(userId);
        if (!result.affected || result.affected === 0) {
            throw new Error(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}