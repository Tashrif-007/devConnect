import 'reflect-metadata';
import { StoryService } from '../services/storyService';
import { StoryRepository } from '../repositories/storyRepository';
import { CategoryService } from '../services/categoryService';
import { AiService } from '../services/aiService';
import {
    CreateStoryDTO,
    UpdateStoryDTO,
    StoryResponseDTO,
} from '../dto/storyDTO';
import { Story } from '../entity/storyEntity';
import { User } from '../entity/userEntity';
import { Category } from '../entity/categoryEntity';
import { UserRole, SortDirection, StoryOrderBy } from '../enums';
import { Auth } from '../entity/authEntity';
import {
    PaginatedResponseDTO,
    PaginationQuery,
} from '../dto/paginationDTO';
import {
    NotFoundError,
    ValidationError,
    OpenRouterError,
} from '../errors/errors';
import { STORY_RESPONSE_MESSAGES, ERROR_MESSAGES } from '../constants/messages';

describe('StoryService', () => {
    let storyService: StoryService;
    let mockStoryRepository: jest.Mocked<StoryRepository>;
    let mockCategoryService: jest.Mocked<CategoryService>;
    let mockAiService: jest.Mocked<AiService>;

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
        deletedAt: null as any,
        user: createMockUser(),
        categories: [createMockCategory()],
        ...overrides,
    });

    beforeEach(() => {
        mockStoryRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            search: jest.fn(),
            findById: jest.fn(),
            updateStory: jest.fn(),
            softDelete: jest.fn(),
        } as unknown as jest.Mocked<StoryRepository>;

        mockCategoryService = {
            getInvalidCategoryIds: jest.fn(),
        } as unknown as jest.Mocked<CategoryService>;

        mockAiService = {
            summarize: jest.fn(),
        } as unknown as jest.Mocked<AiService>;

        storyService = new StoryService(
            mockStoryRepository,
            mockCategoryService,
            mockAiService,
        );

        jest.clearAllMocks();
    });

    describe('createStory', () => {
        it('should create a story with AI summary successfully', async () => {
            const createStoryDTO: CreateStoryDTO = {
                title: 'My First Story',
                body: 'This is the body of my story',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                skip: false,
            };

            const mockStory = createMockStory();
            const generatedSummary = 'AI generated summary';

            mockAiService.summarize.mockResolvedValue(generatedSummary);
            mockStoryRepository.create.mockResolvedValue(mockStory);

            const result = await storyService.createStory(createStoryDTO);

            expect(mockAiService.summarize).toHaveBeenCalledWith(
                createStoryDTO.body,
            );
            expect(mockStoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: createStoryDTO.title,
                    body: createStoryDTO.body,
                    summary: generatedSummary,
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should create a story without AI summary when skip is true', async () => {
            const createStoryDTO: CreateStoryDTO = {
                title: 'My Story',
                body: 'Story body',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                skip: true,
            };

            const mockStory = createMockStory({ summary: undefined });

            mockStoryRepository.create.mockResolvedValue(mockStory);

            const result = await storyService.createStory(createStoryDTO);

            expect(mockAiService.summarize).not.toHaveBeenCalled();
            expect(mockStoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: true,
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should handle AI service error gracefully', async () => {
            const createStoryDTO: CreateStoryDTO = {
                title: 'My Story',
                body: 'Story body',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                skip: false,
            };

            const mockStory = createMockStory({ summary: undefined });

            mockAiService.summarize.mockRejectedValue(
                new Error('AI service error'),
            );
            mockStoryRepository.create.mockResolvedValue(mockStory);

            const result = await storyService.createStory(createStoryDTO);

            expect(mockStoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    summary: undefined,
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should validate category IDs', async () => {
            const createStoryDTO: CreateStoryDTO = {
                title: 'My Story',
                body: 'Story body',
                categoryIds: ['cat-1', 'cat-2'],
                skip: true,
            };

            mockCategoryService.getInvalidCategoryIds.mockResolvedValue([
                'cat-1',
            ]);

            await expect(
                storyService.createStory(createStoryDTO),
            ).rejects.toThrow(ValidationError);
            await expect(
                storyService.createStory(createStoryDTO),
            ).rejects.toThrow(ERROR_MESSAGES.INVALID_CATEGORY_ID);
            expect(mockStoryRepository.create).not.toHaveBeenCalled();
        });

        it('should create story with valid categories', async () => {
            const createStoryDTO: CreateStoryDTO = {
                title: 'My Story',
                body: 'Story body',
                categoryIds: ['cat-1', 'cat-2'],
                skip: true,
            };

            const mockStory = createMockStory();

            mockCategoryService.getInvalidCategoryIds.mockResolvedValue([]);
            mockStoryRepository.create.mockResolvedValue(mockStory);

            const result = await storyService.createStory(createStoryDTO);

            expect(
                mockCategoryService.getInvalidCategoryIds,
            ).toHaveBeenCalledWith(['cat-1', 'cat-2']);
            expect(mockStoryRepository.create).toHaveBeenCalled();
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });
    });

    describe('getAllStories', () => {
        it('should retrieve all stories with default pagination', async () => {
            const paginationDTO: PaginationQuery = {
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: StoryOrderBy.CREATED_AT,
            };

            const mockStories = [
                createMockStory(),
                createMockStory({ storyId: 'story-2', title: 'Second Story' }),
            ];

            mockStoryRepository.findAll.mockResolvedValue({
                data: mockStories,
                total: 2,
            });

            const result = await storyService.getAllStories(paginationDTO);

            expect(mockStoryRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    itemsPerPage: 10,
                }),
            );
            expect(result).toBeInstanceOf(PaginatedResponseDTO);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should search stories when find parameter is provided', async () => {
            const paginationDTO: PaginationQuery = {
                find: 'technology',
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: StoryOrderBy.CREATED_AT,
            };

            const mockStories = [createMockStory()];

            mockStoryRepository.search.mockResolvedValue({
                data: mockStories,
                total: 1,
            });

            const result = await storyService.getAllStories(paginationDTO);

            expect(mockStoryRepository.search).toHaveBeenCalledWith(
                expect.objectContaining({
                    find: 'technology',
                }),
            );
            expect(result.data).toHaveLength(1);
        });

        it('should use default values for missing pagination parameters', async () => {
            const paginationDTO: PaginationQuery = {
                page: undefined as any,
                itemsPerPage: undefined as any,
                sortBy: undefined as any,
                orderBy: undefined as any,
            };

            const mockStories = [createMockStory()];

            mockStoryRepository.findAll.mockResolvedValue({
                data: mockStories,
                total: 1,
            });

            const result = await storyService.getAllStories(paginationDTO);

            expect(mockStoryRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    itemsPerPage: 10,
                    sortBy: SortDirection.DESC,
                    orderBy: StoryOrderBy.CREATED_AT,
                }),
            );
            expect(result.data).toHaveLength(1);
        });

        it('should handle empty story list', async () => {
            const paginationDTO: PaginationQuery = {
                page: 1,
                itemsPerPage: 10,
                sortBy: SortDirection.DESC,
                orderBy: StoryOrderBy.CREATED_AT,
            };

            mockStoryRepository.findAll.mockResolvedValue({
                data: [],
                total: 0,
            });

            const result = await storyService.getAllStories(paginationDTO);

            expect(result.data).toHaveLength(0);
            expect(result.pagination.totalItems).toBe(0);
        });
    });

    describe('getStoryById', () => {
        it('should retrieve a story by ID successfully', async () => {
            const storyId = 'story-123';
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);

            const result = await storyService.getStoryById(storyId);

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(storyId);
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should throw OpenRouterError if story does not exist', async () => {
            const storyId = 'nonexistent-story';

            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(storyService.getStoryById(storyId)).rejects.toThrow(
                NotFoundError,
            );
            await expect(storyService.getStoryById(storyId)).rejects.toThrow(
                STORY_RESPONSE_MESSAGES.NOT_FOUND,
            );
        });
    });

    describe('updateStory', () => {
        it('should update story with new body and regenerate summary', async () => {
            const storyId = 'story-123';
            const updateStoryDTO: UpdateStoryDTO = {
                body: 'Updated body content',
            };

            const updatedStory = createMockStory({
                body: 'Updated body content',
                summary: 'Updated AI summary',
            });

            mockAiService.summarize.mockResolvedValue('Updated AI summary');
            mockStoryRepository.updateStory.mockResolvedValue(updatedStory);

            const result = await storyService.updateStory(
                storyId,
                updateStoryDTO,
            );

            expect(mockAiService.summarize).toHaveBeenCalledWith(
                'Updated body content',
            );
            expect(mockStoryRepository.updateStory).toHaveBeenCalledWith(
                storyId,
                expect.objectContaining({
                    body: 'Updated body content',
                    summary: 'Updated AI summary',
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should update story title without AI summary', async () => {
            const storyId = 'story-123';
            const updateStoryDTO: UpdateStoryDTO = {
                title: 'Updated Title',
            };

            const updatedStory = createMockStory({
                title: 'Updated Title',
            });

            mockStoryRepository.updateStory.mockResolvedValue(updatedStory);

            const result = await storyService.updateStory(
                storyId,
                updateStoryDTO,
            );

            expect(mockAiService.summarize).not.toHaveBeenCalled();
            expect(mockStoryRepository.updateStory).toHaveBeenCalledWith(
                storyId,
                updateStoryDTO,
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should skip AI summarization when body is not provided in update', async () => {
            const storyId = 'story-123';
            const updateStoryDTO: UpdateStoryDTO = {
                title: 'Updated Title',
                categoryIds: ['cat-1'],
            };

            const updatedStory = createMockStory({
                title: 'Updated Title',
            });

            mockCategoryService.getInvalidCategoryIds.mockResolvedValue([]);
            mockStoryRepository.updateStory.mockResolvedValue(updatedStory);

            const result = await storyService.updateStory(
                storyId,
                updateStoryDTO,
            );

            expect(mockAiService.summarize).not.toHaveBeenCalled();
            expect(mockStoryRepository.updateStory).toHaveBeenCalledWith(
                storyId,
                updateStoryDTO,
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should validate updated categories', async () => {
            const storyId = 'story-123';
            const updateStoryDTO: UpdateStoryDTO = {
                categoryIds: ['invalid-cat-1'],
            };

            mockCategoryService.getInvalidCategoryIds.mockResolvedValue([
                'invalid-cat-1',
            ]);

            await expect(
                storyService.updateStory(storyId, updateStoryDTO),
            ).rejects.toThrow(ValidationError);
            expect(mockStoryRepository.updateStory).not.toHaveBeenCalled();
        });

        it('should handle AI service error during update', async () => {
            const storyId = 'story-123';
            const updateStoryDTO: UpdateStoryDTO = {
                body: 'Updated body',
            };

            mockAiService.summarize.mockRejectedValue(
                new Error('AI service error'),
            );
            mockStoryRepository.updateStory.mockResolvedValue(
                createMockStory({ summary: undefined }),
            );

            const result = await storyService.updateStory(
                storyId,
                updateStoryDTO,
            );

            expect(mockStoryRepository.updateStory).toHaveBeenCalledWith(
                storyId,
                expect.objectContaining({
                    body: 'Updated body',
                    summary: undefined,
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should throw NotFoundError if story to update does not exist', async () => {
            const storyId = 'nonexistent-story';
            const updateStoryDTO: UpdateStoryDTO = {
                title: 'Updated Title',
            };

            mockStoryRepository.updateStory.mockResolvedValue(null);

            await expect(
                storyService.updateStory(storyId, updateStoryDTO),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteStory', () => {
        it('should soft delete a story successfully', async () => {
            const storyId = 'story-123';

            mockStoryRepository.softDelete.mockResolvedValue({
                affected: 1,
                raw: {},
                generatedMaps: [],
            });

            await storyService.deleteStory(storyId);

            expect(mockStoryRepository.softDelete).toHaveBeenCalledWith(
                storyId,
            );
        });

        it('should throw NotFoundError if story to delete does not exist', async () => {
            const storyId = 'nonexistent-story';

            mockStoryRepository.softDelete.mockResolvedValue({
                affected: 0,
                raw: {},
                generatedMaps: [],
            });

            await expect(storyService.deleteStory(storyId)).rejects.toThrow(
                NotFoundError,
            );
            await expect(storyService.deleteStory(storyId)).rejects.toThrow(
                STORY_RESPONSE_MESSAGES.NOT_FOUND,
            );
        });
    });

    describe('regenerateSummary', () => {
        it('should regenerate story summary successfully', async () => {
            const storyId = 'story-123';
            const mockStory = createMockStory();
            const newSummary = 'Newly regenerated summary';

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockAiService.summarize.mockResolvedValue(newSummary);
            mockStoryRepository.updateStory.mockResolvedValue(
                createMockStory({ summary: newSummary }),
            );

            const result = await storyService.regenerateSummary(storyId);

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(storyId);
            expect(mockAiService.summarize).toHaveBeenCalledWith(
                mockStory.body,
            );
            expect(mockStoryRepository.updateStory).toHaveBeenCalledWith(
                storyId,
                expect.objectContaining({
                    summary: newSummary,
                }),
            );
            expect(result).toBeInstanceOf(StoryResponseDTO);
        });

        it('should throw NotFoundError if story for summary regeneration does not exist', async () => {
            const storyId = 'nonexistent-story';

            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                storyService.regenerateSummary(storyId),
            ).rejects.toThrow(NotFoundError);
            expect(mockAiService.summarize).not.toHaveBeenCalled();
        });

        it('should throw OpenRouterError if AI summarization fails', async () => {
            const storyId = 'story-123';
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockAiService.summarize.mockRejectedValue(
                new Error('AI service unavailable'),
            );

            await expect(
                storyService.regenerateSummary(storyId),
            ).rejects.toThrow(OpenRouterError);
            await expect(
                storyService.regenerateSummary(storyId),
            ).rejects.toThrow(ERROR_MESSAGES.BAD_GATEWAY);
            expect(mockStoryRepository.updateStory).not.toHaveBeenCalled();
        });

        it('should throw OpenRouterError if updated story is not found', async () => {
            const storyId = 'story-123';
            const mockStory = createMockStory();
            const newSummary = 'New summary';

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockAiService.summarize.mockResolvedValue(newSummary);
            mockStoryRepository.updateStory.mockResolvedValue(null);

            await expect(
                storyService.regenerateSummary(storyId),
            ).rejects.toThrow(OpenRouterError);
            await expect(
                storyService.regenerateSummary(storyId),
            ).rejects.toThrow(ERROR_MESSAGES.BAD_GATEWAY);
        });
    });
});
