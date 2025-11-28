import { AppDataSource } from '../config/dataSource';
import { Story } from '../entity/storyEntity';
import { CreateStoryDTO, UpdateStoryDTO } from '../dto/storyDTO';
import { UpdateResult } from 'typeorm';
import { PaginationResult } from '../dto/paginationDTO';

export class StoryRepository {
    private storyRepository = AppDataSource.getRepository(Story);

    async create(storyData: CreateStoryDTO): Promise<Story> {
        const story = this.storyRepository.create(storyData);
        return this.storyRepository.save(story);
    }

    async findAll(page: number, itemsPerPage: number): Promise<PaginationResult<Story>> {
        const offset = (page - 1) * itemsPerPage;

        const [data, total] = await this.storyRepository.findAndCount({
            skip: offset,
            take: itemsPerPage,
            relations: ['user'],
        });
        return { data, total };
    }

    async search(
        searchTerm: string,
        page: number,
        itemsPerPage: number,
    ): Promise<PaginationResult<Story>> {
        const offset = (page - 1) * itemsPerPage;
        const similarityThreshold = 0.1; // 10% similarity threshold

        const query = this.storyRepository
            .createQueryBuilder('story')
            .leftJoinAndSelect('story.user', 'user')
            .where(
                `(similarity(story.title, :searchTerm) > :threshold OR 
                  similarity(story.body, :searchTerm) > :threshold OR 
                  similarity(user.name, :searchTerm) > :threshold OR
                  story.title ILIKE :ilikeTerm OR
                  story.body ILIKE :ilikeTerm OR
                  user.name ILIKE :ilikeTerm)`,
                { searchTerm, threshold: similarityThreshold },
            )
            .addSelect(
                `GREATEST(similarity(story.title, :searchTerm), similarity(story.body, :searchTerm), similarity(user.name, :searchTerm))`,
                'similarity_score'
            )
            .addOrderBy('similarity_score', 'DESC')
            .skip(offset)
            .take(itemsPerPage)
            .setParameter('searchTerm', searchTerm)
            .setParameter('threshold', similarityThreshold)
            .setParameter('ilikeTerm', `%${searchTerm}%`);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    async findById(storyId: string): Promise<Story | null> {
        return this.storyRepository.findOne({ where: { storyId } });
    }

    async updateStory(
        storyId: string,
        storyData: UpdateStoryDTO,
    ): Promise<Story | null> {
        await this.storyRepository.update(storyId, storyData);
        return this.findById(storyId);
    }

    async softDelete(storyId: string): Promise<UpdateResult> {
        return this.storyRepository.softDelete(storyId);
    }
}
