import { injectable } from 'tsyringe';
import { VoteRepository } from '../repositories/voteRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { VoteType } from '../enums/voteType';
import { NotFoundError } from '../errors/errors';
import { ERROR_MESSAGES } from '../constants/messages';
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
                // If same vote type is submitted again, set to NONE
                await this.voteRepository.update(existingVote.voteId, VoteType.NONE);
            } else {
                // If opposite vote type, update to the new vote type
                await this.voteRepository.update(existingVote.voteId, voteType);
            }
        } else {
            // Create new vote if none exists
            await this.voteRepository.create(userId, storyId, voteType);
        }
        const counts = await this.voteRepository.getVoteCounts(storyId);
        
        // Return the resulting userVote (NONE if toggle, or the new vote type)
        let userVote: VoteType | null;
        if (existingVote && existingVote.voteType === voteType) {
            userVote = VoteType.NONE; // Toggled to NONE
        } else {
            userVote = voteType; // New vote or switched vote
        }
        
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote,
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

    async getVoteStatsOnly(userId: string, storyId: string): Promise<VoteCountResponseDTO> {
        const counts = await this.voteRepository.getVoteCounts(storyId);
        const voteType = await this.voteRepository.getUserVote(userId, storyId);
        const userVote = voteType === VoteType.NONE ? null : voteType;
        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote,
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

        const voteType = await this.voteRepository.getUserVote(userId, storyId);
        const counts = await this.voteRepository.getVoteCounts(storyId);
        const userVote = voteType === VoteType.NONE ? null : voteType;

        return {
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            userVote,
        };
    }
}
