import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/dataSource';
import { Comment } from '../entity/commentEntity';
import { IsNull } from 'typeorm';

@injectable()
export class CommentRepository {
    private repository = AppDataSource.getRepository(Comment);

    async create(
        userId: string,
        storyId: string,
        body: string,
    ): Promise<Comment> {
        const comment = this.repository.create({
            userId,
            storyId,
            body,
        });
        return this.repository.save(comment);
    }

    async findById(commentId: string): Promise<Comment | null> {
        return this.repository.findOne({
            where: {
                commentId,
                deletedAt: IsNull(),
            },
            relations: ['user'],
        });
    }

    async findByStory(
        storyId: string,
        page: number = 1,
        itemsPerPage: number = 10,
    ): Promise<[Comment[], number]> {
        return this.repository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.storyId = :storyId', { storyId })
            .andWhere('comment.deletedAt IS NULL')
            .orderBy('comment.createdAt', 'DESC')
            .skip((page - 1) * itemsPerPage)
            .take(itemsPerPage)
            .getManyAndCount();
    }

    async findByUser(
        userId: string,
        page: number = 1,
        itemsPerPage: number = 10,
    ): Promise<[Comment[], number]> {
        return this.repository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.userId = :userId', { userId })
            .andWhere('comment.deletedAt IS NULL')
            .orderBy('comment.createdAt', 'DESC')
            .skip((page - 1) * itemsPerPage)
            .take(itemsPerPage)
            .getManyAndCount();
    }

    async update(commentId: string, body: string): Promise<Comment> {
        await this.repository.update(commentId, { body });
        const comment = await this.repository.findOne({
            where: { commentId, deletedAt: IsNull() },
            relations: ['user'],
        });
        return comment!;
    }

    async softDelete(commentId: string): Promise<void> {
        await this.repository.update(commentId, { deletedAt: new Date() });
    }

    async countByStory(storyId: string): Promise<number> {
        return this.repository.count({
            where: {
                storyId,
                deletedAt: IsNull(),
            },
        });
    }
}
