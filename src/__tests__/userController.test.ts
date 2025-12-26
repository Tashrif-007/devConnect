import 'reflect-metadata';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import { authenticatedRequest } from '../middlewares/authentication';
import { PaginatedResponseDTO, PaginationMeta } from '../dto/paginationDTO';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { UserRole } from '../enums';
import { User } from '../entity/userEntity';
import { Auth } from '../entity/authEntity';
import { ConflictError, NotFoundError } from '../errors/errors';
import { jwtPayload } from '../dto/authDTO';

describe('UserController', () => {
    let userController: UserController;
    let mockUserService: jest.Mocked<UserService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNextFunction: jest.Mock<void>;

    const createMockUser = (overrides?: Partial<User>): User => ({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: new Date('2024-01-01'),
        role: UserRole.USER,
        isEmailConfirmed: true,
        profilePictureUrl: undefined,
        deletedAt: null,
        auth: {} as Auth,
        stories: [],
        votes: [],
        comments: [],
        ...overrides,
    });

    beforeEach(() => {
        mockUserService = {
            createUser: jest.fn(),
            getAllUsers: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            updateUserRole: jest.fn(),
            updateProfile: jest.fn(),
            deleteUser: jest.fn(),
            getUserByEmail: jest.fn(),
        } as unknown as jest.Mocked<UserService>;

        userController = new UserController(mockUserService);

        mockRequest = {
            body: {},
            params: {},
            query: {},
            headers: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        mockNextFunction = jest.fn();

        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user and return 201 status', async () => {
            const mockUser = createMockUser();
            mockRequest.body = {
                username: 'johndoe',
                name: 'John Doe',
                email: 'john@example.com',
                role: UserRole.USER,
            };

            mockUserService.createUser.mockResolvedValue(mockUser);

            await userController.createUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.createUser).toHaveBeenCalledWith(
                mockRequest.body,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.CREATED,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockUser,
                    USER_RESPONSE_MESSAGES.CREATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on service error', async () => {
            const error = new ConflictError(
                USER_RESPONSE_MESSAGES.USERNAME_EXISTS,
            );
            mockRequest.body = {
                username: 'existinguser',
                name: 'Existing User',
                email: 'new@example.com',
            };

            mockUserService.createUser.mockRejectedValue(error);

            await userController.createUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.createUser).toHaveBeenCalledWith(
                mockRequest.body,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('should retrieve all users with pagination', async () => {
            const mockUsers = [
                createMockUser(),
                createMockUser({ userId: 'user-2', username: 'janedoe' }),
            ];

            const paginationMeta: PaginationMeta = {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 2,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            const paginatedResponse = new PaginatedResponseDTO(
                mockUsers,
                paginationMeta,
            );

            mockRequest.query = {
                page: '1',
                itemsPerPage: '10',
            };

            mockUserService.getAllUsers.mockResolvedValue(paginatedResponse);

            await userController.getAllUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.getAllUsers).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    paginatedResponse,
                    USER_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should handle empty user list', async () => {
            const paginationMeta: PaginationMeta = {
                currentPage: 1,
                itemsPerPage: 10,
                totalItems: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            };

            const paginatedResponse = new PaginatedResponseDTO(
                [],
                paginationMeta,
            );

            mockRequest.query = {};

            mockUserService.getAllUsers.mockResolvedValue(paginatedResponse);

            await userController.getAllUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on service error', async () => {
            const error = new Error('Service error');
            mockRequest.query = {};

            mockUserService.getAllUsers.mockRejectedValue(error);

            await userController.getAllUsers(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by ID successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const mockUser = createMockUser();

            mockRequest.params = { userId };

            mockUserService.getUserById.mockResolvedValue(mockUser);

            await userController.getUserById(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockUser,
                    USER_RESPONSE_MESSAGES.RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass NotFoundError to next middleware when user does not exist', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { userId };

            mockUserService.getUserById.mockRejectedValue(error);

            await userController.getUserById(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateData = { name: 'Updated Name' };
            const updatedUser = createMockUser({ name: 'Updated Name' });

            mockRequest.params = { userId };
            mockRequest.body = updateData;

            mockUserService.updateUser.mockResolvedValue(updatedUser);

            await userController.updateUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateUser).toHaveBeenCalledWith(
                userId,
                updateData,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    updatedUser,
                    USER_RESPONSE_MESSAGES.UPDATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on update failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateData = { name: 'Updated Name' };
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { userId };
            mockRequest.body = updateData;

            mockUserService.updateUser.mockRejectedValue(error);

            await userController.updateUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('updateRole', () => {
        it('should update user role successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updatedUser = createMockUser({ role: UserRole.ADMIN });

            mockRequest.params = { userId };
            mockRequest.body = { role: UserRole.ADMIN };

            mockUserService.updateUser.mockResolvedValue(updatedUser);

            await userController.updateRole(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateUser).toHaveBeenCalledWith(
                userId,
                UserRole.ADMIN,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on role update failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { userId };
            mockRequest.body = { role: UserRole.ADMIN };

            mockUserService.updateUser.mockRejectedValue(error);

            await userController.updateRole(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        it('should delete a user and return 204 status', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';

            mockRequest.params = { userId };

            mockUserService.deleteUser.mockResolvedValue(undefined);

            await userController.deleteUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.NO_CONTENT,
            );
            expect(mockResponse.send).toHaveBeenCalled();
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on delete failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { userId };

            mockUserService.deleteUser.mockRejectedValue(error);

            await userController.deleteUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('should retrieve authenticated user profile', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const mockUser = createMockUser();

            const authenticatedReq =
                mockRequest as unknown as authenticatedRequest;
            authenticatedReq.decoded = { userId } as jwtPayload;

            mockUserService.getUserById.mockResolvedValue(mockUser);

            await userController.getProfile(
                authenticatedReq,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockUser,
                    USER_RESPONSE_MESSAGES.RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on profile retrieval failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            const authenticatedReq =
                mockRequest as unknown as authenticatedRequest;
            authenticatedReq.decoded = { userId } as jwtPayload;

            mockUserService.getUserById.mockRejectedValue(error);

            await userController.getProfile(
                authenticatedReq,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('updateProfile', () => {
        it('should update authenticated user profile', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileData = {
                name: 'Updated Name',
                profilePictureUrl: 'https://example.com/pic.jpg',
            };
            const updatedUser = createMockUser({
                name: 'Updated Name',
                profilePictureUrl: 'https://example.com/pic.jpg',
            });

            const authenticatedReq =
                mockRequest as unknown as authenticatedRequest;
            authenticatedReq.decoded = { userId } as jwtPayload;
            authenticatedReq.body = updateProfileData;

            mockUserService.updateProfile.mockResolvedValue(updatedUser);

            await userController.updateProfile(
                authenticatedReq,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateProfile).toHaveBeenCalledWith(
                userId,
                updateProfileData,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    updatedUser,
                    USER_RESPONSE_MESSAGES.UPDATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should update only name in profile', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileData = { name: 'New Name' };
            const updatedUser = createMockUser({ name: 'New Name' });

            const authenticatedReq =
                mockRequest as unknown as authenticatedRequest;
            authenticatedReq.decoded = { userId } as jwtPayload;
            authenticatedReq.body = updateProfileData;

            mockUserService.updateProfile.mockResolvedValue(updatedUser);

            await userController.updateProfile(
                authenticatedReq,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateProfile).toHaveBeenCalledWith(
                userId,
                updateProfileData,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on profile update failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updateProfileData = { name: 'New Name' };
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            const authenticatedReq =
                mockRequest as unknown as authenticatedRequest;
            authenticatedReq.decoded = { userId } as jwtPayload;
            authenticatedReq.body = updateProfileData;

            mockUserService.updateProfile.mockRejectedValue(error);

            await userController.updateProfile(
                authenticatedReq,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateProfile).toHaveBeenCalledWith(
                userId,
                updateProfileData,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });
});
