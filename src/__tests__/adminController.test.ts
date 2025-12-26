import 'reflect-metadata';
import { AdminController } from '../controllers/adminController';
import { UserService } from '../services/userService';
import { Request, Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { UserRole } from '../enums';
import { User } from '../entity/userEntity';
import { Auth } from '../entity/authEntity';
import { NotFoundError } from '../errors/errors';

describe('AdminController', () => {
    let adminController: AdminController;
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
            updateUserRole: jest.fn(),
        } as unknown as jest.Mocked<UserService>;

        adminController = new AdminController(mockUserService);

        mockRequest = {
            body: {},
            params: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNextFunction = jest.fn();

        jest.clearAllMocks();
    });

    describe('updateUserRole', () => {
        it('should update user role to ADMIN successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updatedUser = createMockUser({ role: UserRole.ADMIN });

            mockRequest.params = { userId };
            mockRequest.body = { role: UserRole.ADMIN };

            mockUserService.updateUserRole.mockResolvedValue(updatedUser);

            await adminController.updateUserRole(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
                userId,
                UserRole.ADMIN,
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

        it('should update user role to USER successfully', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const updatedUser = createMockUser({ role: UserRole.USER });

            mockRequest.params = { userId };
            mockRequest.body = { role: UserRole.USER };

            mockUserService.updateUserRole.mockResolvedValue(updatedUser);

            await adminController.updateUserRole(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
                userId,
                UserRole.USER,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on role update failure', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const error = new NotFoundError(USER_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { userId };
            mockRequest.body = { role: UserRole.ADMIN };

            mockUserService.updateUserRole.mockRejectedValue(error);

            await adminController.updateUserRole(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockUserService.updateUserRole).toHaveBeenCalledWith(
                userId,
                UserRole.ADMIN,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });
});
