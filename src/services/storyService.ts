import { StoryRepository } from '../repositories/storyRepository';
import { CreateStoryDto, StoryResponseDto } from '../dto/storyDTO';

export class StoryService {
    private storyRepository: StoryRepository;

    constructor() {
        this.storyRepository = new StoryRepository();
    }

    async createStory(storyData: CreateStoryDto): Promise<StoryResponseDto> {
        return this.storyRepository.create(storyData);
    }
}
