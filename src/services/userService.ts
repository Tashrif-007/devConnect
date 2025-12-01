import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dto/userDTO';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { ConflictError, NotFoundError } from '../errors/errors';
import {
    PaginatedResponse,
    PaginationMeta,
    PaginationRequestDTO,
} from '../dto/paginationDTO';

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
            throw new ConflictError(USER_RESPONSE_MESSAGES.USERNAME_EXISTS);
        }

        const existingUserByEmail = await this.userRepository.findByEmail(
            userData.email,
        );
        if (existingUserByEmail) {
            throw new ConflictError(USER_RESPONSE_MESSAGES.EMAIL_EXISTS);
        }

        const user = await this.userRepository.create(userData);
        return UserResponseDTO.fromEntity(user);
    }

    async getAllUsers(
        paginationDTO: PaginationRequestDTO,
    ): Promise<PaginatedResponse<UserResponseDTO>> {
        const page = paginationDTO.page || 1;
        const itemsPerPage = paginationDTO.itemsPerPage || 10;
        const searchTerm = paginationDTO.searchTerm;

        const result = searchTerm
            ? await this.userRepository.search(searchTerm, page, itemsPerPage)
            : await this.userRepository.findAll(page, itemsPerPage);
        const users = UserResponseDTO.fromEntities(result.data);

        const totalPages = Math.ceil(result.total / itemsPerPage);
        const pagination: PaginationMeta = {
            currentPage: page,
            itemsPerPage,
            totalItems: result.total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return { data: users, pagination };
    }

    async getUserById(userId: string): Promise<UserResponseDTO> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return UserResponseDTO.fromEntity(user);
    }
    async updateUser(
        userId: string,
        userData: UpdateUserDTO,
    ): Promise<UserResponseDTO> {
        const user = await this.userRepository.update(userId, userData);
        if (!user) {
            throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return UserResponseDTO.fromEntity(user);
    }
    async deleteUser(userId: string): Promise<void> {
        const result = await this.userRepository.softDelete(userId);
        if (!result.affected) {
            throw new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}
