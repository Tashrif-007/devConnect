import { AppDataSource } from '../config/dataSource';
import { Story } from '../entity/storyEntity';
import { CreateStoryDto } from '../dto/storyDTO';

export class StoryRepository {
    private storyRepository = AppDataSource.getRepository(Story);

    async create(storyData: CreateStoryDto): Promise<Story> {
        const story = this.storyRepository.create(storyData);
        return this.storyRepository.save(story);
    }
}
