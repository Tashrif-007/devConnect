import 'reflect-metadata';
import { CommentService } from '../services/commentService';
import { CommentRepository } from '../repositories/commentRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { Comment } from '../entity/commentEntity';
import { Story } from '../entity/storyEntity';
import { User } from '../entity/userEntity';
import { CommentResponseDTO } from '../dto/commentDTO';
import { ForbiddenError, NotFoundError } from '../errors/errors';
import { UserRole } from '../enums';
import { Auth } from '../entity/authEntity';

jest.mock('../config/dataSource');

describe('CommentService', () => {
    let commentService: CommentService;
    let mockCommentRepository: jest.Mocked<CommentRepository>;
    let mockStoryRepository: jest.Mocked<StoryRepository>;

    const createMockUser = (overrides?: Partial<User>): User => ({
        userId: 'user-123',
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
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

    const createMockStory = (overrides?: Partial<Story>): Story => ({
        storyId: 'story-123',
        title: 'Test Story',
        body: 'This is a test story',
        userId: 'user-123',
        summary: 'Summary',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        user: createMockUser(),
        categories: [],
        votes: [],
        comments: [],
        ...overrides,
    });

    const createMockComment = (overrides?: Partial<Comment>): Comment => ({
        commentId: 'comment-123',
        userId: 'user-123',
        storyId: 'story-123',
        body: 'This is a comment',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        user: createMockUser(),
        story: createMockStory(),
        ...overrides,
    });

    beforeEach(() => {
        mockCommentRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByStory: jest.fn(),
            findByUser: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            countByStory: jest.fn(),
        } as unknown as jest.Mocked<CommentRepository>;

        mockStoryRepository = {
            findById: jest.fn(),
        } as unknown as jest.Mocked<StoryRepository>;

        commentService = new CommentService(
            mockCommentRepository,
            mockStoryRepository,
        );
        jest.clearAllMocks();
    });

    describe('createComment', () => {
        it('should create a comment successfully', async () => {
            const mockStory = createMockStory();
            const mockComment = createMockComment();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockCommentRepository.create.mockResolvedValue(mockComment);
            mockCommentRepository.findById.mockResolvedValue(mockComment);

            const result = await commentService.createComment(
                'user-123',
                'story-123',
                'This is a comment',
            );

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'story-123',
            );
            expect(mockCommentRepository.create).toHaveBeenCalledWith(
                'user-123',
                'story-123',
                'This is a comment',
            );
            expect(result).toBeInstanceOf(CommentResponseDTO);
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.createComment(
                    'user-123',
                    'nonexistent-story',
                    'Comment body',
                ),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getCommentsByStory', () => {
        it('should get paginated comments for a story', async () => {
            const mockStory = createMockStory();
            const mockComments = [createMockComment()];
            const total = 1;

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockCommentRepository.findByStory.mockResolvedValue([
                mockComments,
                total,
            ]);

            const result = await commentService.getCommentsByStory(
                'story-123',
                1,
                10,
            );

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'story-123',
            );
            expect(mockCommentRepository.findByStory).toHaveBeenCalledWith(
                'story-123',
                1,
                10,
            );
            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
        });

        it('should use default pagination parameters when not provided', async () => {
            const mockStory = createMockStory();
            const mockComments = [createMockComment()];
            const total = 1;

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockCommentRepository.findByStory.mockResolvedValue([
                mockComments,
                total,
            ]);

            const result = await commentService.getCommentsByStory('story-123');

            expect(mockCommentRepository.findByStory).toHaveBeenCalledWith(
                'story-123',
                1,
                10,
            );
            expect(result.pagination.currentPage).toBe(1);
            expect(result.pagination.itemsPerPage).toBe(10);
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.getCommentsByStory('nonexistent-story', 1, 10),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getCommentById', () => {
        it('should get a comment by ID', async () => {
            const mockComment = createMockComment();

            mockCommentRepository.findById.mockResolvedValue(mockComment);

            const result = await commentService.getCommentById('comment-123');

            expect(mockCommentRepository.findById).toHaveBeenCalledWith(
                'comment-123',
            );
            expect(result).toBeInstanceOf(CommentResponseDTO);
        });

        it('should throw NotFoundError when comment does not exist', async () => {
            mockCommentRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.getCommentById('nonexistent-comment'),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateComment', () => {
        it('should update a comment successfully', async () => {
            const mockComment = createMockComment();
            const updatedComment = createMockComment({
                body: 'Updated comment body',
            });

            mockCommentRepository.findById.mockResolvedValue(mockComment);
            mockCommentRepository.update.mockResolvedValue(updatedComment);

            const result = await commentService.updateComment(
                'comment-123',
                'user-123',
                'Updated comment body',
            );

            expect(mockCommentRepository.update).toHaveBeenCalledWith(
                'comment-123',
                'Updated comment body',
            );
            expect(result).toBeInstanceOf(CommentResponseDTO);
        });

        it('should throw ForbiddenError when user is not owner', async () => {
            const mockComment = createMockComment({
                userId: 'other-user-123',
            });

            mockCommentRepository.findById.mockResolvedValue(mockComment);

            await expect(
                commentService.updateComment(
                    'comment-123',
                    'user-123',
                    'Updated body',
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError when comment does not exist', async () => {
            mockCommentRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.updateComment(
                    'nonexistent-comment',
                    'user-123',
                    'Updated body',
                ),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment successfully', async () => {
            const mockComment = createMockComment();

            mockCommentRepository.findById.mockResolvedValue(mockComment);
            mockCommentRepository.softDelete.mockResolvedValue(undefined);

            await commentService.deleteComment('comment-123', 'user-123');

            expect(mockCommentRepository.softDelete).toHaveBeenCalledWith(
                'comment-123',
            );
        });

        it('should throw ForbiddenError when user is not owner', async () => {
            const mockComment = createMockComment({
                userId: 'other-user-123',
            });

            mockCommentRepository.findById.mockResolvedValue(mockComment);

            await expect(
                commentService.deleteComment('comment-123', 'user-123'),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError when comment does not exist', async () => {
            mockCommentRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.deleteComment('nonexistent-comment', 'user-123'),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getCommentsByStoryOnly', () => {
        it('should get comments without checking story existence', async () => {
            const mockComments = [createMockComment()];

            mockCommentRepository.findByStory.mockResolvedValue([
                mockComments,
                1,
            ]);

            const result = await commentService.getCommentsByStoryOnly(
                'story-123',
                1,
                10,
            );

            expect(mockStoryRepository.findById).not.toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(CommentResponseDTO);
        });

        it('should use default pagination parameters when not provided', async () => {
            const mockComments = [createMockComment()];

            mockCommentRepository.findByStory.mockResolvedValue([
                mockComments,
                1,
            ]);

            const result =
                await commentService.getCommentsByStoryOnly('story-123');

            expect(mockCommentRepository.findByStory).toHaveBeenCalledWith(
                'story-123',
                1,
                10,
            );
            expect(mockStoryRepository.findById).not.toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });

        it('should return empty array when no comments exist', async () => {
            mockCommentRepository.findByStory.mockResolvedValue([[], 0]);

            const result = await commentService.getCommentsByStoryOnly(
                'story-123',
                1,
                10,
            );

            expect(mockStoryRepository.findById).not.toHaveBeenCalled();
            expect(result).toHaveLength(0);
        });

        it('should throw NotFoundError when story does not exist in getCommentsByStory', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                commentService.getCommentsByStory('non-existent-story', 1, 10),
            ).rejects.toThrow(NotFoundError);

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'non-existent-story',
            );
            expect(mockCommentRepository.findByStory).not.toHaveBeenCalled();
        });
    });
});
