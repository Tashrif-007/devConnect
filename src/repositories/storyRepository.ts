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
        });
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
