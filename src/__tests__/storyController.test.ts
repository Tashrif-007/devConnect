import 'reflect-metadata';
import { StoryController } from '../controllers/storyController';
import { StoryService } from '../services/storyService';
import { Request, Response } from 'express';
import { PaginatedResponseDTO, PaginationMeta } from '../dto/paginationDTO';
import { StoryResponseDTO } from '../dto/storyDTO';
import { VoteCountResponseDTO } from '../dto/voteDTO';
import { UserResponseDTO } from '../dto/userDTO';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import {
    STORY_RESPONSE_MESSAGES,
    SUMMARY_RESPONSE_MESSAGES,
} from '../constants/messages';
import { UserRole } from '../enums';
import { Story } from '../entity/storyEntity';
import { User } from '../entity/userEntity';
import { Category } from '../entity/categoryEntity';
import { Auth } from '../entity/authEntity';
import { authenticatedRequest } from '../middlewares/authentication';
import { NotFoundError, ValidationError } from '../errors/errors';

describe('StoryController', () => {
    let storyController: StoryController;
    let mockStoryService: jest.Mocked<StoryService>;
    let mockRequest: Partial<authenticatedRequest>;
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

    const createMockCategory = (overrides?: Partial<Category>): Category => ({
        categoryId: 'cat-123',
        name: 'Technology',
        description: 'Technology stories',
        createdAt: new Date('2024-01-01'),
        deletedAt: null as any,
        stories: [],
        ...overrides,
    });

    const createMockStory = (overrides?: Partial<Story>): Story => ({
        storyId: 'story-123',
        title: 'My First Story',
        body: 'This is the body of my story',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        summary: 'Story summary',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        user: createMockUser(),
        categories: [createMockCategory()],
        votes: [],
        comments: [],
        ...overrides,
    });

    const createMockStoryResponseDTO = (
        overrides?: Record<string, unknown>,
    ): StoryResponseDTO =>
        ({
            storyId: 'story-123',
            title: 'My First Story',
            body: 'This is the body of my story',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            summary: 'Story summary',
            user: {
                userId: '123e4567-e89b-12d3-a456-426614174000',
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                joinDate: new Date('2024-01-01'),
                isEmailConfirmed: true,
                role: UserRole.USER,
            } as UserResponseDTO,
            categoryNames: ['Technology'],
            votes: {
                upvotes: 0,
                downvotes: 0,
                userVote: null,
            } as VoteCountResponseDTO,
            comments: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...(overrides as Record<string, unknown>),
        }) as unknown as StoryResponseDTO;

    beforeEach(() => {
        mockStoryService = {
            createStory: jest.fn(),
            getAllStories: jest.fn(),
            getStoryById: jest.fn(),
            getStoriesByUserId: jest.fn(),
            updateStory: jest.fn(),
            deleteStory: jest.fn(),
            regenerateSummary: jest.fn(),
        } as unknown as jest.Mocked<StoryService>;

        storyController = new StoryController(mockStoryService);

        mockRequest = {
            body: {},
            params: {},
            query: {},
            headers: {},
            decoded: {
                userId: '123e4567-e89b-12d3-a456-426614174000',
                email: 'john@example.com',
                username: 'johndoe',
                role: UserRole.USER,
                iat: Math.floor(Date.now() / 1000),
            },
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNextFunction = jest.fn();

        jest.clearAllMocks();
    });

    describe('createStory', () => {
        it('should create a story and return 201 status', async () => {
            const mockStoryDTO = createMockStoryResponseDTO();
            const createStoryDTO = {
                title: 'My Story',
                body: 'Story body content',
                skip: false,
            };

            mockRequest.body = createStoryDTO;
            mockStoryService.createStory.mockResolvedValue(mockStoryDTO);

            await storyController.createStory(
                mockRequest as authenticatedRequest,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.createStory).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: createStoryDTO.title,
                    body: createStoryDTO.body,
                    userId: mockRequest.decoded?.userId,
                }),
                mockRequest.decoded?.userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.CREATED,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockStoryDTO,
                    STORY_RESPONSE_MESSAGES.CREATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should set userId from decoded token', async () => {
            const mockStoryDTO = createMockStoryResponseDTO();
            const createStoryDTO = {
                title: 'My Story',
                body: 'Story body content',
                skip: false,
            };

            mockRequest.body = createStoryDTO;
            mockRequest.decoded = {
                userId: 'different-user-id',
                email: 'different@example.com',
                username: 'differentuser',
                role: UserRole.ADMIN,
                iat: Math.floor(Date.now() / 1000),
            };

            mockStoryService.createStory.mockResolvedValue(mockStoryDTO);

            await storyController.createStory(
                mockRequest as authenticatedRequest,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.createStory).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'different-user-id',
                }),
                'different-user-id',
            );
        });

        it('should pass error to next middleware on service error', async () => {
            const error = new ValidationError('Invalid story data');
            mockRequest.body = { title: '', body: '' };

            mockStoryService.createStory.mockRejectedValue(error);

            await storyController.createStory(
                mockRequest as authenticatedRequest,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getAllStories', () => {
        it('should retrieve all stories with pagination', async () => {
            const mockStories = [
                createMockStoryResponseDTO(),
                createMockStoryResponseDTO({
                    storyId: 'story-2',
                    title: 'Second Story',
                }),
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
                mockStories,
                paginationMeta,
            );

            mockRequest.query = { page: '1', itemsPerPage: '10' };
            mockStoryService.getAllStories.mockResolvedValue(paginatedResponse);

            await storyController.getAllStories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.getAllStories).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    paginatedResponse,
                    STORY_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on service error', async () => {
            const error = new Error('Service error');
            mockRequest.query = {};

            mockStoryService.getAllStories.mockRejectedValue(error);

            await storyController.getAllStories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getStoryById', () => {
        it('should retrieve a story by ID successfully', async () => {
            const storyId = 'story-123';
            const mockStoryDTO = createMockStoryResponseDTO();

            mockRequest.params = { storyId };
            mockStoryService.getStoryById.mockResolvedValue(mockStoryDTO);

            await storyController.getStoryById(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.getStoryById).toHaveBeenCalledWith(
                storyId,
                mockRequest.decoded?.userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockStoryDTO,
                    STORY_RESPONSE_MESSAGES.RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass NotFoundError to next middleware when story does not exist', async () => {
            const storyId = 'nonexistent-story';
            const error = new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { storyId };
            mockStoryService.getStoryById.mockRejectedValue(error);

            await storyController.getStoryById(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.getStoryById).toHaveBeenCalledWith(
                storyId,
                mockRequest.decoded?.userId,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('updateStory', () => {
        it('should update a story successfully', async () => {
            const storyId = 'story-123';
            const updateData = { title: 'Updated Title' };
            const updatedStoryDTO = createMockStoryResponseDTO({
                title: 'Updated Title',
            });

            mockRequest.params = { storyId };
            mockRequest.body = updateData;

            mockStoryService.updateStory.mockResolvedValue(updatedStoryDTO);

            await storyController.updateStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.updateStory).toHaveBeenCalledWith(
                storyId,
                updateData,
                mockRequest.decoded?.userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    updatedStoryDTO,
                    STORY_RESPONSE_MESSAGES.UPDATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should update story body and regenerate summary', async () => {
            const storyId = 'story-123';
            const updateData = { body: 'Updated body content' };
            const updatedStoryDTO = createMockStoryResponseDTO({
                body: 'Updated body content',
                summary: 'New AI summary',
            });

            mockRequest.params = { storyId };
            mockRequest.body = updateData;

            mockStoryService.updateStory.mockResolvedValue(updatedStoryDTO);

            await storyController.updateStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.updateStory).toHaveBeenCalledWith(
                storyId,
                updateData,
                mockRequest.decoded?.userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on update failure', async () => {
            const storyId = 'nonexistent-story';
            const updateData = { title: 'Updated' };
            const error = new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { storyId };
            mockRequest.body = updateData;

            mockStoryService.updateStory.mockRejectedValue(error);

            await storyController.updateStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('deleteStory', () => {
        it('should delete a story and return success response', async () => {
            const storyId = 'story-123';

            mockRequest.params = { storyId };
            mockStoryService.deleteStory.mockResolvedValue(undefined);

            await storyController.deleteStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(STORY_RESPONSE_MESSAGES.DELETED),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on delete failure', async () => {
            const storyId = 'nonexistent-story';
            const error = new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { storyId };
            mockStoryService.deleteStory.mockRejectedValue(error);

            await storyController.deleteStory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('regenerateSummary', () => {
        it('should regenerate story summary successfully', async () => {
            const storyId = 'story-123';
            const mockStoryDTO = createMockStoryResponseDTO({
                summary: 'Newly regenerated summary',
            });

            mockRequest.params = { storyId };
            mockStoryService.regenerateSummary.mockResolvedValue(mockStoryDTO);

            await storyController.regenerateSummary(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.regenerateSummary).toHaveBeenCalledWith(
                storyId,
                mockRequest.decoded?.userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockStoryDTO,
                    SUMMARY_RESPONSE_MESSAGES.CREATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on regenerate failure', async () => {
            const storyId = 'nonexistent-story';
            const error = new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);

            mockRequest.params = { storyId };
            mockStoryService.regenerateSummary.mockRejectedValue(error);

            await storyController.regenerateSummary(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.regenerateSummary).toHaveBeenCalledWith(
                storyId,
                mockRequest.decoded?.userId,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should handle AI service errors during regeneration', async () => {
            const storyId = 'story-123';
            const error = new Error('AI service unavailable');

            mockRequest.params = { storyId };
            mockStoryService.regenerateSummary.mockRejectedValue(error);

            await storyController.regenerateSummary(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.regenerateSummary).toHaveBeenCalledWith(
                storyId,
                mockRequest.decoded?.userId,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
        });
    });

    describe('getStoriesByUserId', () => {
        it('should retrieve stories by user ID successfully', async () => {
            const userId = 'user-123';
            const mockPaginatedResponse = {
                data: [createMockStoryResponseDTO()],
                pagination: {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockRequest.params = { userId };
            mockStoryService.getStoriesByUserId.mockResolvedValue(
                mockPaginatedResponse,
            );

            await storyController.getStoriesByUserId(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockStoryService.getStoriesByUserId).toHaveBeenCalledWith(
                userId,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockPaginatedResponse,
                    STORY_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware when service fails', async () => {
            const userId = 'user-123';
            const error = new Error('Service error');

            mockRequest.params = { userId };
            mockStoryService.getStoriesByUserId.mockRejectedValue(error);

            await storyController.getStoriesByUserId(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });
});
