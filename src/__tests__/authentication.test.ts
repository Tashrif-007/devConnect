import 'reflect-metadata';
import {
    authentication,
    authenticatedRequest,
} from '../middlewares/authentication';
import { Request, Response } from 'express';
import { UnauthorizedError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
import * as jwtUtil from '../utils/jwtUtil';
import { UserRole } from '../enums';

jest.mock('../utils/jwtUtil');

describe('Authentication Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNextFunction: jest.Mock<void>;
    const authMiddleware = authentication();

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };

        mockResponse = {};

        mockNextFunction = jest.fn();

        jest.clearAllMocks();
    });

    describe('authentication', () => {
        it('should authenticate with valid Bearer token', async () => {
            const mockPayload = {
                userId: 'user-123',
                email: 'john@example.com',
                username: 'johndoe',
                role: UserRole.USER,
            };

            mockRequest.headers = {
                authorization: 'Bearer valid-token-123',
            };

            (jwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(jwtUtil.verifyToken).toHaveBeenCalledWith('valid-token-123');
            expect((mockRequest as authenticatedRequest).decoded).toEqual(
                mockPayload,
            );
            expect(mockNextFunction).toHaveBeenCalled();
        });

        it('should throw UnauthorizedError if no authorization header', () => {
            mockRequest.headers = {};

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should throw UnauthorizedError if authorization header is missing', () => {
            mockRequest.headers = {
                authorization: undefined,
            };

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should throw UnauthorizedError if Bearer prefix is missing', () => {
            mockRequest.headers = {
                authorization: 'valid-token-123',
            };

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should throw UnauthorizedError if token part is missing', () => {
            mockRequest.headers = {
                authorization: 'Bearer',
            };

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should not throw if invalid prefix but only when exactly 2 parts', () => {
            mockRequest.headers = {
                authorization: 'InvalidPrefix token',
            };

            const mockPayload = {
                userId: 'user-123',
                email: 'john@example.com',
                username: 'johndoe',
                role: UserRole.USER,
            };

            (jwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith();
        });

        it('should throw UnauthorizedError if token is invalid', () => {
            mockRequest.headers = {
                authorization: 'Bearer invalid-token',
            };

            (jwtUtil.verifyToken as jest.Mock).mockImplementation(() => {
                throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
            });

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should handle admin role in decoded payload', () => {
            const mockPayload = {
                userId: 'admin-123',
                email: 'admin@example.com',
                username: 'admin',
                role: UserRole.ADMIN,
            };

            mockRequest.headers = {
                authorization: 'Bearer admin-token',
            };

            (jwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect((mockRequest as authenticatedRequest).decoded?.role).toBe(
                UserRole.ADMIN,
            );
            expect(mockNextFunction).toHaveBeenCalled();
        });

        it('should extract token correctly from Bearer header', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            const mockPayload = {
                userId: 'user-123',
                email: 'john@example.com',
                username: 'johndoe',
                role: UserRole.USER,
            };

            mockRequest.headers = {
                authorization: `Bearer ${token}`,
            };

            (jwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(jwtUtil.verifyToken).toHaveBeenCalledWith(token);
        });

        it('should throw error when multiple parts with invalid prefix', () => {
            mockRequest.headers = {
                authorization: 'invalid format with parts',
            };

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it('should successfully authenticate with Bearer prefix in 2-part format', () => {
            const mockPayload = {
                userId: 'user-456',
                email: 'jane@example.com',
                username: 'jane',
                role: UserRole.USER,
            };

            mockRequest.headers = {
                authorization: 'Bearer valid-long-token-with-special-chars',
            };

            (jwtUtil.verifyToken as jest.Mock).mockReturnValue(mockPayload);

            authMiddleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith();
            expect((mockRequest as authenticatedRequest).decoded).toEqual(
                mockPayload,
            );
        });
    });
});
