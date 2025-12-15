import 'reflect-metadata';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { AUTH_RESPONSE_MESSAGES } from '../constants/messages';
import {
    SignupDTO,
    LoginDTO,
    LoginResponseDTO,
    jwtPayload,
} from '../dto/authDTO';
import { UserRole } from '../enums';
import { UserResponseDTO } from '../dto/userDTO';
import { authenticatedRequest } from '../middlewares/authentication';

jest.mock('../services/authService');

describe('AuthController', () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>;

    beforeEach(() => {
        mockAuthService = {
            signup: jest.fn(),
            login: jest.fn(),
            confirmEmail: jest.fn(),
            resendConfirmationEmail: jest.fn(),
            changePassword: jest.fn(),
            validateCode: jest.fn(),
            updatePassword: jest.fn(),
            verifyUserAuthExists: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        authController = new AuthController(mockAuthService);

        mockRequest = {
            body: {},
            params: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();

        jest.clearAllMocks();
    });

    describe('signup', () => {
        it('should successfully sign up a new user and return 201 CREATED', async () => {
            const signupDTO: SignupDTO = {
                username: 'newuser',
                name: 'New User',
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };

            const mockUserResponse = {
                userId: '123e4567-e89b-12d3-a456-426614174000',
                username: 'newuser',
                email: 'newuser@example.com',
                name: 'New User',
                role: UserRole.USER,
                isEmailConfirmed: false,
            };

            mockRequest.body = signupDTO;
            mockAuthService.signup.mockResolvedValue(
                mockUserResponse as UserResponseDTO,
            );

            await authController.signup(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.signup).toHaveBeenCalledWith(signupDTO);
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.CREATED,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockUserResponse,
                    message: AUTH_RESPONSE_MESSAGES.SIGNUP_SUCCESS,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on signup failure', async () => {
            const signupDTO: SignupDTO = {
                username: 'newuser',
                name: 'New User',
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                confirmPassword: 'SecurePass123!',
            };
            const error = new Error('Signup failed');

            mockRequest.body = signupDTO;
            mockAuthService.signup.mockRejectedValue(error);

            await authController.signup(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.signup).toHaveBeenCalledWith(signupDTO);
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should successfully log in a user and return 200 OK', async () => {
            const loginDTO: LoginDTO = {
                email: 'john@example.com',
                password: 'SecurePass123!',
            };

            const mockLoginResponse = {
                token: 'jwt-token-123',
                user: {
                    userId: '123e4567-e89b-12d3-a456-426614174000',
                    email: 'john@example.com',
                    username: 'johndoe',
                    role: UserRole.USER,
                    isEmailConfirmed: true,
                },
            };

            mockRequest.body = loginDTO;
            mockAuthService.login.mockResolvedValue(
                mockLoginResponse as LoginResponseDTO,
            );

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDTO);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockLoginResponse,
                    message: AUTH_RESPONSE_MESSAGES.LOGIN_SUCCESS,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on login failure', async () => {
            const loginDTO: LoginDTO = {
                email: 'john@example.com',
                password: 'WrongPassword123!',
            };
            const error = new Error('Invalid credentials');

            mockRequest.body = loginDTO;
            mockAuthService.login.mockRejectedValue(error);

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDTO);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('confirmEmail', () => {
        it('should successfully confirm email and return 200 OK', async () => {
            const token = 'email-confirmation-token-123';

            const mockUserResponse = {
                userId: '123e4567-e89b-12d3-a456-426614174000',
                email: 'john@example.com',
                username: 'johndoe',
                name: 'John Doe',
                role: UserRole.USER,
                isEmailConfirmed: true,
            };

            mockRequest.params = { token };
            mockAuthService.confirmEmail.mockResolvedValue(
                mockUserResponse as UserResponseDTO,
            );

            await authController.confirmEmail(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(token);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockUserResponse,
                    message: AUTH_RESPONSE_MESSAGES.EMAIL_CONFIRMED,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on invalid token', async () => {
            const token = 'invalid-token';
            const error = new Error('Invalid or expired token');

            mockRequest.params = { token };
            mockAuthService.confirmEmail.mockRejectedValue(error);

            await authController.confirmEmail(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(token);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('resendConfirmationEmail', () => {
        it('should successfully resend confirmation email and return 200 OK', async () => {
            const email = 'john@example.com';
            const mockResponse_data = {
                message: AUTH_RESPONSE_MESSAGES.CONFIRMATION_EMAIL_RESENT,
            };

            mockRequest.body = { email };
            mockAuthService.resendConfirmationEmail.mockResolvedValue(
                mockResponse_data,
            );

            await authController.resendConfirmationEmail(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(
                mockAuthService.resendConfirmationEmail,
            ).toHaveBeenCalledWith(email);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockResponse_data,
                    message: AUTH_RESPONSE_MESSAGES.CONFIRMATION_EMAIL_RESENT,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware if user not found', async () => {
            const email = 'nonexistent@example.com';
            const error = new Error('User not found');

            mockRequest.body = { email };
            mockAuthService.resendConfirmationEmail.mockRejectedValue(error);

            await authController.resendConfirmationEmail(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(
                mockAuthService.resendConfirmationEmail,
            ).toHaveBeenCalledWith(email);
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if email already confirmed', async () => {
            const email = 'john@example.com';
            const error = new Error('Email already confirmed');

            mockRequest.body = { email };
            mockAuthService.resendConfirmationEmail.mockRejectedValue(error);

            await authController.resendConfirmationEmail(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('changePassword', () => {
        it('should successfully request password change and return 200 OK', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const password = 'OldPass123!';

            mockRequest.body = { password };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.changePassword.mockResolvedValue(undefined);

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.changePassword).toHaveBeenCalledWith(
                userId,
                password,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: AUTH_RESPONSE_MESSAGES.PASSWORD_CHANGE_REQUESTED,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware if password is invalid', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const password = 'WrongPassword123!';
            const error = new Error('Invalid password');

            mockRequest.body = { password };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.changePassword.mockRejectedValue(error);

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.changePassword).toHaveBeenCalledWith(
                userId,
                password,
            );
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if user not found', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const password = 'OldPass123!';
            const error = new Error('User not found');

            mockRequest.body = { password };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.changePassword.mockRejectedValue(error);

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('validateCode', () => {
        it('should successfully validate code and return session token', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const confirmationCode = '123456';

            const mockValidateResponse = {
                message: AUTH_RESPONSE_MESSAGES.CODE_VALIDATED,
                sessionToken: 'session-token-123',
            };

            mockRequest.body = { confirmationCode };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.validateCode.mockResolvedValue(
                mockValidateResponse,
            );

            await authController.validateCode(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.validateCode).toHaveBeenCalledWith(
                userId,
                confirmationCode,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockValidateResponse,
                    message: AUTH_RESPONSE_MESSAGES.CODE_VALIDATED,
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware if code is invalid', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const confirmationCode = 'wrong-code';
            const error = new Error('Invalid code');

            mockRequest.body = { confirmationCode };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.validateCode.mockRejectedValue(error);

            await authController.validateCode(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.validateCode).toHaveBeenCalledWith(
                userId,
                confirmationCode,
            );
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if code has expired', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const confirmationCode = '123456';
            const error = new Error('Code has expired');

            mockRequest.body = { confirmationCode };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.validateCode.mockRejectedValue(error);

            await authController.validateCode(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if code has been used', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const confirmationCode = '123456';
            const error = new Error('Code has already been used');

            mockRequest.body = { confirmationCode };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.validateCode.mockRejectedValue(error);

            await authController.validateCode(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updatePassword', () => {
        it('should successfully update password and return 200 OK', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const newPassword = 'NewPass123!';
            const sessionToken = 'session-token-123';

            const mockUpdateResponse = {
                message: 'Password updated successfully',
            };

            mockRequest.body = { newPassword, sessionToken };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.updatePassword.mockResolvedValue(
                mockUpdateResponse,
            );

            await authController.updatePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
                userId,
                newPassword,
                sessionToken,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockUpdateResponse,
                    message: 'Password updated successfully',
                }),
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware if session token is invalid', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const newPassword = 'NewPass123!';
            const sessionToken = 'invalid-token';
            const error = new Error('Invalid or expired session token');

            mockRequest.body = { newPassword, sessionToken };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.updatePassword.mockRejectedValue(error);

            await authController.updatePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
                userId,
                newPassword,
                sessionToken,
            );
            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if code has expired', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const newPassword = 'NewPass123!';
            const sessionToken = 'session-token-123';
            const error = new Error('Code has expired');

            mockRequest.body = { newPassword, sessionToken };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.updatePassword.mockRejectedValue(error);

            await authController.updatePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if code has been used', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const newPassword = 'NewPass123!';
            const sessionToken = 'session-token-123';
            const error = new Error('Code has already been used');

            mockRequest.body = { newPassword, sessionToken };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.updatePassword.mockRejectedValue(error);

            await authController.updatePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should pass error to next middleware if user not found', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const newPassword = 'NewPass123!';
            const sessionToken = 'session-token-123';
            const error = new Error('User not found');

            mockRequest.body = { newPassword, sessionToken };
            (mockRequest as authenticatedRequest).decoded = {
                userId,
            } as jwtPayload;
            mockAuthService.updatePassword.mockRejectedValue(error);

            await authController.updatePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
