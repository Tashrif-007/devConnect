import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/dataSource';
import { Vote } from '../entity/voteEntity';
import { VoteType } from '../enums/voteType';
import { IsNull } from 'typeorm';

@injectable()
export class VoteRepository {
    private repository = AppDataSource.getRepository(Vote);

    async create(
        userId: string,
        storyId: string,
        voteType: VoteType,
    ): Promise<Vote> {
        const vote = this.repository.create({
            userId,
            storyId,
            voteType,
        });
        return this.repository.save(vote);
    }

    async findByUserAndStory(
        userId: string,
        storyId: string,
    ): Promise<Vote | null> {
        return this.repository.findOne({
            where: {
                userId,
                storyId,
                deletedAt: IsNull(),
            },
        });
    }

    async update(voteId: string, voteType: VoteType): Promise<Vote> {
        await this.repository.update(voteId, { voteType });
        const vote = await this.repository.findOne({
            where: { voteId, deletedAt: IsNull() },
            relations: ['user'],
        });
        return vote!;
    }

    async softDelete(userId: string, storyId: string): Promise<void> {
        await this.repository.update(
            { userId, storyId, deletedAt: IsNull() },
            { deletedAt: new Date() },
        );
    }

    async getVoteCounts(
        storyId: string,
    ): Promise<{ upvotes: number; downvotes: number }> {
        const result = await this.repository
            .createQueryBuilder('vote')
            .select(
                'COUNT(CASE WHEN vote.voteType = :upvote THEN 1 END)',
                'upvotes',
            )
            .addSelect(
                'COUNT(CASE WHEN vote.voteType = :downvote THEN 1 END)',
                'downvotes',
            )
            .where('vote.storyId = :storyId', { storyId })
            .andWhere('vote.deletedAt IS NULL')
            .setParameters({
                upvote: VoteType.UPVOTE,
                downvote: VoteType.DOWNVOTE,
            })
            .getRawOne();

        return {
            upvotes: parseInt(result?.upvotes || 0),
            downvotes: parseInt(result?.downvotes || 0),
        };
    }

    async getUserVote(
        userId: string,
        storyId: string,
    ): Promise<VoteType | null> {
        const vote = await this.repository.findOne({
            where: {
                userId,
                storyId,
                deletedAt: IsNull(),
            },
        });

        return vote?.voteType || null;
    }
}
