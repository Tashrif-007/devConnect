import { injectable } from 'tsyringe';
import { VoteRepository } from '../repositories/voteRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { VoteType } from '../enums/voteType';
import { ConflictError, NotFoundError } from '../errors/errors';
import { VOTE_RESPONSE_MESSAGES, ERROR_MESSAGES } from '../constants/messages';
import { VoteCountResponseDTO } from '../dto/voteDTO';

@injectable()
export class VoteService {
    constructor(
        private voteRepository: VoteRepository,
        private storyRepository: StoryRepository,
    ) {}

    async addVote(
        userId: string,
        storyId: string,
        voteType: VoteType,
    ): Promise<VoteCountResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const existingVote = await this.voteRepository.findByUserAndStory(
            userId,
            storyId,
        );

        if (existingVote) {
            if (existingVote.voteType === voteType) {
                throw new ConflictError(
                    VOTE_RESPONSE_MESSAGES.VOTE_ALREADY_EXISTS,
                );
            }
            await this.voteRepository.update(existingVote.voteId, voteType);
        } else {
            await this.voteRepository.create(userId, storyId, voteType);
        }
        const counts = await this.voteRepository.getVoteCounts(storyId);
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote: voteType,
        };
    }

    async removeVote(
        userId: string,
        storyId: string,
    ): Promise<VoteCountResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const vote = await this.voteRepository.findByUserAndStory(
            userId,
            storyId,
        );
        if (!vote) {
            throw new NotFoundError(VOTE_RESPONSE_MESSAGES.VOTE_NOT_FOUND);
        }
        await this.voteRepository.softDelete(userId, storyId);
        const counts = await this.voteRepository.getVoteCounts(storyId);
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote: null,
        };
    }

    async getVoteStats(storyId: string): Promise<VoteCountResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        const counts = await this.voteRepository.getVoteCounts(storyId);
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
        };
    }

    async getVoteStatsOnly(storyId: string): Promise<VoteCountResponseDTO> {
        const counts = await this.voteRepository.getVoteCounts(storyId);
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
        };
    }

    async getUserVote(
        userId: string,
        storyId: string,
    ): Promise<VoteCountResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        if (!story) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        const userVote = await this.voteRepository.getUserVote(userId, storyId);
        const counts = await this.voteRepository.getVoteCounts(storyId);

        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote,
        };
    }
}
