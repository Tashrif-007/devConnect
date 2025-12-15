import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import {
    CreateUserDTO,
    UpdateUserDTO,
    UpdateProfileDTO,
    UserResponseDTO,
} from '../dto/userDTO';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { ConflictError, NotFoundError } from '../errors/errors';
import { PaginatedResponseDTO, PaginationQuery } from '../dto/paginationDTO';
import { User } from '../entity/userEntity';
import { UserRole, SortDirection, UserOrderBy } from '../enums';
import { Auth } from '../entity/authEntity';

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    const createMockUser = (overrides?: Partial<User>): User => ({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: new Date('2024-01-01'),
        role: UserRole.USER,
        isEmailConfirmed: false,
        profilePictureUrl: undefined,
        deletedAt: null,
        auth: {} as Auth,
        stories: [],
        ...overrides,
    });

    beforeEach(() => {
        mockUserRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            search: jest.fn(),
            findById: jest.fn(),
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;

        userService = new UserService(mockUserRepository);
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const createUserDTO: CreateUserDTO = {
                username: 'johndoe',
                name: 'John Doe',
                email: 'john@example.com',
                role: UserRole.USER,
            };

            const mockUser = createMockUser();

            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockUser);

            const result = await userService.createUser(createUserDTO);

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
                'johndoe',
            );
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
                'john@example.com',
            );
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                createUserDTO,
            );
            expect(result).toBeInstanceOf(UserResponseDTO);
            expect(result.username).toBe('johndoe');
            expect(result.email).toBe('john@example.com');
        });

        it('should throw ConflictError if username already exists', async () => {
            const createUserDTO: CreateUserDTO = {
                username: 'existinguser',
                name: 'Existing User',
                email: 'new@example.com',
            };

            const existingUser = createMockUser({
                username: 'existinguser',
            });

            mockUserRepository.findByUsername.mockResolvedValue(existingUser);

            await expect(userService.createUser(createUserDTO)).rejects.toThrow(
                ConflictError,
            );
            await expect(userService.createUser(createUserDTO)).rejects.toThrow(
                USER_RESPONSE_MESSAGES.USERNAME_EXISTS,
            );
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictError if email already exists', async () => {
            const createUserDTO: CreateUserDTO = {
                username: 'newuser',
                name: 'New User',
                email: 'existing@example.com',
            };

            const existingUser = createMockUser({
                email: 'existing@example.com',
            });

            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(userService.createUser(createUserDTO)).rejects.toThrow(
                ConflictError,
            );
            await expect(userService.createUser(createUserDTO)).rejects.toThrow(
                USER_RESPONSE_MESSAGES.EMAIL_EXISTS,
            );
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('should retrieve all users with default pagination', async () => {
            const paginationDTO: PaginationQuery = {
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: UserOrderBy.USER_ID,
            };
            const mockUsers = [
                createMockUser(),
                createMockUser({ userId: 'user-2', username: 'janedoe' }),
            ];

            mockUserRepository.findAll.mockResolvedValue({
                data: mockUsers,
                total: 2,
            });

            const result = await userService.getAllUsers(paginationDTO);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith(
                1,
                10,
                SortDirection.DESC,
                UserOrderBy.USER_ID,
            );
            expect(result).toBeInstanceOf(PaginatedResponseDTO);
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toBeInstanceOf(UserResponseDTO);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should retrieve users with custom pagination parameters', async () => {
            const paginationDTO: PaginationQuery = {
                page: 2,
                itemsPerPage: 5,
                sortBy: SortDirection.ASC,
                orderBy: UserOrderBy.USERNAME,
            };
            const mockUsers = [createMockUser()];

            mockUserRepository.findAll.mockResolvedValue({
                data: mockUsers,
                total: 15,
            });

            const result = await userService.getAllUsers(paginationDTO);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith(
                2,
                5,
                SortDirection.ASC,
                UserOrderBy.USERNAME,
            );
            expect(result.pagination.totalPages).toBe(3);
        });

        it('should search users when find parameter is provided', async () => {
            const paginationDTO: PaginationQuery = {
                find: 'john',
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: UserOrderBy.USER_ID,
            };
            const mockUsers = [createMockUser()];

            mockUserRepository.search.mockResolvedValue({
                data: mockUsers,
                total: 1,
            });

            const result = await userService.getAllUsers(paginationDTO);

            expect(mockUserRepository.search).toHaveBeenCalledWith(
                'john',
                1,
                10,
                SortDirection.DESC,
                UserOrderBy.USER_ID,
            );
            expect(result.data).toHaveLength(1);
        });

        it('should handle empty user list', async () => {
            const paginationDTO: PaginationQuery = {
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: UserOrderBy.USER_ID,
            };

            mockUserRepository.findAll.mockResolvedValue({
                data: [],
                total: 0,
            });

            const result = await userService.getAllUsers(paginationDTO);

            expect(result.data).toHaveLength(0);
            expect(result.pagination.totalItems).toBe(0);
        });

        it('should use default values for missing pagination parameters', async () => {
            const paginationDTO: PaginationQuery = {
                page: undefined as any,
                itemsPerPage: undefined as any,
                sortBy: undefined as any,
                orderBy: undefined as any,
            };
            const mockUsers = [createMockUser()];

            mockUserRepository.findAll.mockResolvedValue({
                data: mockUsers,
                total: 1,
            });

            const result = await userService.getAllUsers(paginationDTO);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith(
                1,
                10,
                SortDirection.DESC,
                UserOrderBy.USER_ID,
            );
            expect(result.data).toHaveLength(1);
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by ID successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const mockUser = createMockUser();

            mockUserRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getUserById(userId);

            expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
            expect(result).toBeInstanceOf(UserResponseDTO);
            expect(result.userId).toBe(userId);
        });

        it('should throw NotFoundError if user does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';

            mockUserRepository.findById.mockResolvedValue(null);

            await expect(userService.getUserById(userId)).rejects.toThrow(
                NotFoundError,
            );
            await expect(userService.getUserById(userId)).rejects.toThrow(
                USER_RESPONSE_MESSAGES.NOT_FOUND,
            );
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateUserDTO: UpdateUserDTO = {
                name: 'Updated Name',
            };
            const updatedUser = createMockUser({
                name: 'Updated Name',
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateUser(userId, updateUserDTO);

            expect(mockUserRepository.update).toHaveBeenCalledWith(
                userId,
                updateUserDTO,
            );
            expect(result).toBeInstanceOf(UserResponseDTO);
            expect(result.name).toBe('Updated Name');
        });

        it('should throw NotFoundError if user to update does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateUserDTO: UpdateUserDTO = { name: 'Updated' };

            mockUserRepository.update.mockResolvedValue(null);

            await expect(
                userService.updateUser(userId, updateUserDTO),
            ).rejects.toThrow(NotFoundError);
            await expect(
                userService.updateUser(userId, updateUserDTO),
            ).rejects.toThrow(USER_RESPONSE_MESSAGES.NOT_FOUND);
        });
    });

    describe('updateUserRole', () => {
        it('should update user role to ADMIN successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updatedUser = createMockUser({
                role: UserRole.ADMIN,
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateUserRole(
                userId,
                UserRole.ADMIN,
            );

            expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
                role: UserRole.ADMIN,
            } as UpdateUserDTO);
            expect(result.role).toBe(UserRole.ADMIN);
        });

        it('should update user role to USER successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updatedUser = createMockUser({
                role: UserRole.USER,
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateUserRole(
                userId,
                UserRole.USER,
            );

            expect(result.role).toBe(UserRole.USER);
        });

        it('should throw NotFoundError if user to update role does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';

            mockUserRepository.update.mockResolvedValue(null);

            await expect(
                userService.updateUserRole(userId, UserRole.ADMIN),
            ).rejects.toThrow(NotFoundError);
            await expect(
                userService.updateUserRole(userId, UserRole.ADMIN),
            ).rejects.toThrow(USER_RESPONSE_MESSAGES.NOT_FOUND);
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileDTO: UpdateProfileDTO = {
                name: 'Updated Name',
                profilePictureUrl: 'https://example.com/picture.jpg',
            };
            const updatedUser = createMockUser({
                name: 'Updated Name',
                profilePictureUrl: 'https://example.com/picture.jpg',
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(
                userId,
                updateProfileDTO,
            );

            expect(mockUserRepository.update).toHaveBeenCalledWith(
                userId,
                updateProfileDTO,
            );
            expect(result.name).toBe('Updated Name');
            expect(result.profilePictureUrl).toBe(
                'https://example.com/picture.jpg',
            );
        });

        it('should update only name in profile', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileDTO: UpdateProfileDTO = {
                name: 'New Name',
            };
            const updatedUser = createMockUser({
                name: 'New Name',
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(
                userId,
                updateProfileDTO,
            );

            expect(result.name).toBe('New Name');
        });

        it('should update only profilePictureUrl in profile', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileDTO: UpdateProfileDTO = {
                profilePictureUrl: 'https://example.com/new-pic.jpg',
            };
            const updatedUser = createMockUser({
                profilePictureUrl: 'https://example.com/new-pic.jpg',
            });

            mockUserRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile(
                userId,
                updateProfileDTO,
            );

            expect(result.profilePictureUrl).toBe(
                'https://example.com/new-pic.jpg',
            );
        });

        it('should throw NotFoundError if user to update profile does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileDTO: UpdateProfileDTO = {
                name: 'New Name',
            };

            mockUserRepository.update.mockResolvedValue(null);

            await expect(
                userService.updateProfile(userId, updateProfileDTO),
            ).rejects.toThrow(NotFoundError);
            await expect(
                userService.updateProfile(userId, updateProfileDTO),
            ).rejects.toThrow(USER_RESPONSE_MESSAGES.NOT_FOUND);
        });
    });

    describe('deleteUser', () => {
        it('should soft delete a user successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';

            mockUserRepository.softDelete.mockResolvedValue({
                affected: 1,
                raw: {},
                generatedMaps: [],
            });

            await userService.deleteUser(userId);

            expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundError if user to delete does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';

            mockUserRepository.softDelete.mockResolvedValue({
                affected: 0,
                raw: {},
                generatedMaps: [],
            });

            await expect(userService.deleteUser(userId)).rejects.toThrow(
                NotFoundError,
            );
            await expect(userService.deleteUser(userId)).rejects.toThrow(
                USER_RESPONSE_MESSAGES.NOT_FOUND,
            );
        });
    });

    describe('getUserByEmail', () => {
        it('should retrieve a user by email successfully', async () => {
            const email = 'john@example.com';
            const mockUser = createMockUser();

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            const result = await userService.getUserByEmail(email);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(mockUser);
        });

        it('should return null if user with email does not exist', async () => {
            const email = 'nonexistent@example.com';

            mockUserRepository.findByEmail.mockResolvedValue(null);

            const result = await userService.getUserByEmail(email);

            expect(result).toBeNull();
        });
    });
});
