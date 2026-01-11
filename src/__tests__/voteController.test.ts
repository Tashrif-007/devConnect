import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { VoteController } from '../controllers/voteController';
import { VoteService } from '../services/voteService';
import { VoteType } from '../enums/voteType';
import { HttpStatus } from '../constants/httpStatus';
import type { authenticatedRequest } from '../middlewares/authentication';
import { jwtPayload } from '../dto/authDTO';

jest.mock('../config/dataSource');

describe('VoteController', () => {
    let voteController: VoteController;
    let mockVoteService: jest.Mocked<VoteService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>;

    beforeEach(() => {
        mockVoteService = {
            addVote: jest.fn(),
            getVoteStats: jest.fn(),
            getVoteStatsOnly: jest.fn(),
            getUserVote: jest.fn(),
        } as unknown as jest.Mocked<VoteService>;

        voteController = new VoteController(mockVoteService);

        mockRequest = {
            params: {},
            body: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('addVote', () => {
        it('should add a vote successfully', async () => {
            const voteStats = {
                upvotes: 1,
                downvotes: 0,
                userVote: VoteType.UPVOTE,
            };

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };
            mockRequest.body = { voteType: VoteType.UPVOTE };

            mockVoteService.addVote.mockResolvedValue(voteStats);

            await voteController.addVote(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockVoteService.addVote).toHaveBeenCalledWith(
                'user-123',
                'story-123',
                VoteType.UPVOTE,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(
                HttpStatus.CREATED,
            );
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Vote service error');

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };
            mockRequest.body = { voteType: VoteType.UPVOTE };

            mockVoteService.addVote.mockRejectedValue(error);

            await voteController.addVote(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserVote', () => {
        it('should get user vote successfully', async () => {
            const voteStats = {
                upvotes: 5,
                downvotes: 2,
                userVote: VoteType.UPVOTE,
            };

            const authReq = mockRequest as authenticatedRequest;
            authReq.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };

            mockVoteService.getUserVote.mockResolvedValue(voteStats);

            await voteController.getUserVote(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockVoteService.getUserVote).toHaveBeenCalledWith(
                'user-123',
                'story-123',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Vote service error');

            const authReq3 = mockRequest as authenticatedRequest;
            authReq3.decoded = { userId: 'user-123' } as jwtPayload;
            mockRequest.params = { storyId: 'story-123' };

            mockVoteService.getUserVote.mockRejectedValue(error);

            await voteController.getUserVote(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getVoteStats', () => {
        it('should get vote stats successfully', async () => {
            const voteStats = {
                upvotes: 5,
                downvotes: 2,
            };

            mockRequest.params = { storyId: 'story-123' };

            mockVoteService.getVoteStats.mockResolvedValue(voteStats);

            await voteController.getVoteStats(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockVoteService.getVoteStats).toHaveBeenCalledWith(
                'story-123',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Vote service error');

            mockRequest.params = { storyId: 'story-123' };

            mockVoteService.getVoteStats.mockRejectedValue(error);

            await voteController.getVoteStats(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
