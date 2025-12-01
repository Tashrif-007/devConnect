import { AppDataSource } from '../config/dataSource';
import { Story } from '../entity/storyEntity';
import { CreateStoryDTO, UpdateStoryDTO } from '../dto/storyDTO';
import { UpdateResult } from 'typeorm';
import { SortDirection, StoryOrderBy } from '../enums';

export class StoryRepository {
    private storyRepository = AppDataSource.getRepository(Story);

    async create(storyData: CreateStoryDTO): Promise<Story> {
        const story = this.storyRepository.create(storyData);
        return this.storyRepository.save(story);
    }

    async findAll(
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: StoryOrderBy = StoryOrderBy.CREATED_AT,
    ): Promise<{ data: Story[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        const query = this.storyRepository
            .createQueryBuilder('story')
            .leftJoinAndSelect('story.user', 'user')
            .orderBy(orderBy, sortBy)
            .skip(offset)
            .take(itemsPerPage);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async search(
        searchTerm: string,
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: StoryOrderBy = StoryOrderBy.CREATED_AT,
    ): Promise<{ data: Story[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        const query = this.storyRepository
            .createQueryBuilder('story')
            .leftJoinAndSelect('story.user', 'user')
            .where(
                `story.title ILIKE :find
                OR story.body ILIKE :find
                OR user.name ILIKE :find`,
                { find: `%${searchTerm}%` },
            )
            .orderBy(orderBy, sortBy)
            .skip(offset)
            .take(itemsPerPage);

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
