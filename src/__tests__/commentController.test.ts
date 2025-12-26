import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { CommentController } from '../controllers/commentController';
import { CommentService } from '../services/commentService';
import { CommentResponseDTO, CommentsPageResponseDTO } from '../dto/commentDTO';
import { HttpStatus } from '../constants/httpStatus';
import type { authenticatedRequest } from '../middlewares/authentication';
import { jwtPayload } from '../dto/authDTO';

jest.mock('../config/dataSource');

describe('CommentController', () => {
    let commentController: CommentController;
    let mockCommentService: jest.Mocked<CommentService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>;

    const createMockComment = (
        overrides?: Record<string, unknown>,
    ): CommentResponseDTO => ({
        commentId: 'comment-123',
        body: 'This is a comment',
        storyId: 'story-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {
            userId: 'user-123',
            name: 'Test User',
            username: 'testuser',
            profilePictureUrl: null,
        },
        ...(overrides as Record<string, unknown>),
    });

    beforeEach(() => {
        mockCommentService = {
            createComment: jest.fn(),
            getCommentsByStory: jest.fn(),
            getCommentById: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
            getCommentsByStoryOnly: jest.fn(),
        } as unknown as jest.Mocked<CommentService>;

        commentController = new CommentController(mockCommentService);

        mockRequest = {
            params: {},
            body: {},
            query: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('createComment', () => {
        it('should create a comment successfully', async () => {
            const mockComment = createMockComment();

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };
            mockRequest.body = { body: 'This is a comment' };

            mockCommentService.createComment.mockResolvedValue(mockComment);

            await commentController.createComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.createComment).toHaveBeenCalledWith(
                'user-123',
                'story-123',
                'This is a comment',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.CREATED,
            );
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Comment service error');

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };
            mockRequest.body = { body: 'This is a comment' };

            mockCommentService.createComment.mockRejectedValue(error);

            await commentController.createComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getCommentsByStory', () => {
        it('should get paginated comments successfully', async () => {
            const mockComments = [createMockComment()];
            const mockResponse_data: CommentsPageResponseDTO = {
                data: mockComments,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 10,
                },
            };

            mockRequest.params = { storyId: 'story-123' };
            mockRequest.query = { page: '1', itemsPerPage: '10' };

            mockCommentService.getCommentsByStory.mockResolvedValue(
                mockResponse_data,
            );

            await commentController.getCommentsByStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.getCommentsByStory).toHaveBeenCalledWith(
                'story-123',
                1,
                10,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should use default pagination values when not provided', async () => {
            const mockComments = [createMockComment()];
            const mockResponse_data: CommentsPageResponseDTO = {
                data: mockComments,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 10,
                },
            };

            mockRequest.params = { storyId: 'story-123' };
            mockRequest.query = {};

            mockCommentService.getCommentsByStory.mockResolvedValue(
                mockResponse_data,
            );

            await commentController.getCommentsByStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.getCommentsByStory).toHaveBeenCalledWith(
                'story-123',
                1,
                10,
            );
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Comment service error');

            mockRequest.params = { storyId: 'story-123' };
            mockRequest.query = {};

            mockCommentService.getCommentsByStory.mockRejectedValue(error);

            await commentController.getCommentsByStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getCommentById', () => {
        it('should get a comment by ID successfully', async () => {
            const mockComment = createMockComment();

            mockRequest.params = { commentId: 'comment-123' };

            mockCommentService.getCommentById.mockResolvedValue(mockComment);

            await commentController.getCommentById(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.getCommentById).toHaveBeenCalledWith(
                'comment-123',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Comment service error');

            mockRequest.params = { commentId: 'comment-123' };
            mockCommentService.getCommentById.mockRejectedValue(error);

            await commentController.getCommentById(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateComment', () => {
        it('should update a comment successfully', async () => {
            const mockComment = createMockComment({
                body: 'Updated comment',
            });

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { commentId: 'comment-123' };
            mockRequest.body = { body: 'Updated comment' };

            mockCommentService.updateComment.mockResolvedValue(mockComment);

            await commentController.updateComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.updateComment).toHaveBeenCalledWith(
                'comment-123',
                'user-123',
                'Updated comment',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Comment service error');

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { commentId: 'comment-123' };
            mockRequest.body = { body: 'Updated comment' };

            mockCommentService.updateComment.mockRejectedValue(error);

            await commentController.updateComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment successfully', async () => {
            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { commentId: 'comment-123' };

            mockCommentService.deleteComment.mockResolvedValue(undefined);

            await commentController.deleteComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockCommentService.deleteComment).toHaveBeenCalledWith(
                'comment-123',
                'user-123',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Comment service error');

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { commentId: 'comment-123' };

            mockCommentService.deleteComment.mockRejectedValue(error);

            await commentController.deleteComment(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
