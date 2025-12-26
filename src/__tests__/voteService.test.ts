import 'reflect-metadata';
import { VoteService } from '../services/voteService';
import { VoteRepository } from '../repositories/voteRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { Vote } from '../entity/voteEntity';
import { Story } from '../entity/storyEntity';
import { User } from '../entity/userEntity';
import { VoteType } from '../enums/voteType';
import { ConflictError, NotFoundError } from '../errors/errors';
import { UserRole } from '../enums';
import { Auth } from '../entity/authEntity';
import { VOTE_RESPONSE_MESSAGES } from '../constants/messages';

jest.mock('../config/dataSource');

describe('VoteService', () => {
    let voteService: VoteService;
    let mockVoteRepository: jest.Mocked<VoteRepository>;
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

    const createMockVote = (overrides?: Partial<Vote>): Vote => ({
        voteId: 'vote-123',
        userId: 'user-123',
        storyId: 'story-123',
        voteType: VoteType.UPVOTE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: new Date('2024-01-01'),
        user: createMockUser(),
        story: createMockStory(),
        ...overrides,
    });

    beforeEach(() => {
        mockVoteRepository = {
            create: jest.fn(),
            findByUserAndStory: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            getVoteCounts: jest.fn(),
            getUserVote: jest.fn(),
        } as unknown as jest.Mocked<VoteRepository>;

        mockStoryRepository = {
            findById: jest.fn(),
        } as unknown as jest.Mocked<StoryRepository>;

        voteService = new VoteService(mockVoteRepository, mockStoryRepository);
        jest.clearAllMocks();
    });

    describe('addVote', () => {
        it('should create a new vote successfully', async () => {
            const mockStory = createMockStory();
            const mockVote = createMockVote();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.findByUserAndStory.mockResolvedValue(null);
            mockVoteRepository.create.mockResolvedValue(mockVote);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 1,
                downvotes: 0,
            });

            const result = await voteService.addVote(
                'user-123',
                'story-123',
                VoteType.UPVOTE,
            );

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'story-123',
            );
            expect(mockVoteRepository.create).toHaveBeenCalledWith(
                'user-123',
                'story-123',
                VoteType.UPVOTE,
            );
            expect(result).toEqual({
                upvotes: 1,
                downvotes: 0,
                userVote: VoteType.UPVOTE,
            });
        });

        it('should update vote when changing from upvote to downvote', async () => {
            const mockStory = createMockStory();
            const existingVote = createMockVote({
                voteType: VoteType.UPVOTE,
            });

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.findByUserAndStory.mockResolvedValue(
                existingVote,
            );
            mockVoteRepository.update.mockResolvedValue(existingVote);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 0,
                downvotes: 1,
            });

            const result = await voteService.addVote(
                'user-123',
                'story-123',
                VoteType.DOWNVOTE,
            );

            expect(mockVoteRepository.update).toHaveBeenCalledWith(
                'vote-123',
                VoteType.DOWNVOTE,
            );
            expect(result.downvotes).toBe(1);
        });

        it('should throw ConflictError when voting same type twice', async () => {
            const mockStory = createMockStory();
            const existingVote = createMockVote({
                voteType: VoteType.UPVOTE,
            });

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.findByUserAndStory.mockResolvedValue(
                existingVote,
            );

            await expect(
                voteService.addVote('user-123', 'story-123', VoteType.UPVOTE),
            ).rejects.toThrow(ConflictError);
            await expect(
                voteService.addVote('user-123', 'story-123', VoteType.UPVOTE),
            ).rejects.toThrow(VOTE_RESPONSE_MESSAGES.VOTE_ALREADY_EXISTS);
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                voteService.addVote(
                    'user-123',
                    'nonexistent-story',
                    VoteType.UPVOTE,
                ),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('removeVote', () => {
        it('should remove vote successfully', async () => {
            const mockStory = createMockStory();
            const mockVote = createMockVote();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.findByUserAndStory.mockResolvedValue(mockVote);
            mockVoteRepository.softDelete.mockResolvedValue(undefined);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 0,
                downvotes: 0,
            });

            const result = await voteService.removeVote(
                'user-123',
                'story-123',
            );

            expect(mockVoteRepository.softDelete).toHaveBeenCalledWith(
                'user-123',
                'story-123',
            );
            expect(result).toEqual({
                upvotes: 0,
                downvotes: 0,
                userVote: null,
            });
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                voteService.removeVote('user-123', 'nonexistent-story'),
            ).rejects.toThrow(NotFoundError);

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'nonexistent-story',
            );
            expect(
                mockVoteRepository.findByUserAndStory,
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when vote does not exist', async () => {
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.findByUserAndStory.mockResolvedValue(null);

            await expect(
                voteService.removeVote('user-123', 'story-123'),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getVoteStats', () => {
        it('should get vote stats successfully', async () => {
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 5,
                downvotes: 2,
            });

            const result = await voteService.getVoteStats('story-123');

            expect(result).toEqual({
                upvotes: 5,
                downvotes: 2,
            });
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                voteService.getVoteStats('nonexistent-story'),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getVoteStatsOnly', () => {
        it('should get vote stats without checking story existence', async () => {
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 3,
                downvotes: 1,
            });

            const result = await voteService.getVoteStatsOnly('story-123');

            expect(mockStoryRepository.findById).not.toHaveBeenCalled();
            expect(result).toEqual({
                upvotes: 3,
                downvotes: 1,
            });
        });
    });

    describe('getUserVote', () => {
        it('should get user vote with stats', async () => {
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.getUserVote.mockResolvedValue(VoteType.UPVOTE);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 10,
                downvotes: 3,
            });

            const result = await voteService.getUserVote(
                'user-123',
                'story-123',
            );

            expect(result).toEqual({
                upvotes: 10,
                downvotes: 3,
                userVote: VoteType.UPVOTE,
            });
        });

        it('should throw NotFoundError when story does not exist', async () => {
            mockStoryRepository.findById.mockResolvedValue(null);

            await expect(
                voteService.getUserVote('user-123', 'nonexistent-story'),
            ).rejects.toThrow(NotFoundError);

            expect(mockStoryRepository.findById).toHaveBeenCalledWith(
                'nonexistent-story',
            );
            expect(mockVoteRepository.getUserVote).not.toHaveBeenCalled();
        });

        it('should get user vote when no vote exists', async () => {
            const mockStory = createMockStory();

            mockStoryRepository.findById.mockResolvedValue(mockStory);
            mockVoteRepository.getUserVote.mockResolvedValue(null);
            mockVoteRepository.getVoteCounts.mockResolvedValue({
                upvotes: 5,
                downvotes: 2,
            });

            const result = await voteService.getUserVote(
                'user-123',
                'story-123',
            );

            expect(result).toEqual({
                upvotes: 5,
                downvotes: 2,
                userVote: null,
            });
        });
    });
});
