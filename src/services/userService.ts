import { UserRepository } from '../repositories/userRepository';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dto/userDTO';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { ConflictError, NotFoundError } from '../errors/errors';
import {
    PaginatedResponseDTO,
    PaginationQuery,
    createPaginatedResponse,
} from '../dto/paginationDTO';
import { SortDirection, UserOrderBy, UserRole } from '../enums';
import { User } from '../entity/userEntity';

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
        paginationDTO: PaginationQuery,
    ): Promise<PaginatedResponseDTO<UserResponseDTO>> {
        const page = paginationDTO.page || 1;
        const itemsPerPage = paginationDTO.itemsPerPage || 10;
        const find = paginationDTO.find;
        const sortBy = paginationDTO.sortBy || SortDirection.DESC;
        const orderBy = paginationDTO.orderBy || UserOrderBy.USER_ID;

        const result = find
            ? await this.userRepository.search(
                  find,
                  page,
                  itemsPerPage,
                  sortBy,
                  orderBy as UserOrderBy,
              )
            : await this.userRepository.findAll(
                  page,
                  itemsPerPage,
                  sortBy,
                  orderBy as UserOrderBy,
              );

        const users = UserResponseDTO.fromEntities(result.data);
        return createPaginatedResponse(users, result.total, page, itemsPerPage);
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
    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
}
