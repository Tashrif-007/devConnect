import { StoryRepository } from '../repositories/storyRepository';
import { CreateStoryDTO, StoryResponseDTO, UpdateStoryDTO } from '../dto/storyDTO';
import { mapStoryToResponseDTO } from '../utils/userMapper';
import { Story } from '../entity/storyEntity';

export class StoryService {
    private storyRepository: StoryRepository;

    constructor() {
        this.storyRepository = new StoryRepository();
    }

    async createStory(storyData: CreateStoryDTO): Promise<StoryResponseDTO> {
        return this.storyRepository.create(storyData);
    }

    async getAllStories(): Promise<StoryResponseDTO[]> {
        const stories = await this.storyRepository.findAll();
        return stories.map((story) => mapStoryToResponseDTO(story));
    }

    async getStoryById(storyId: string): Promise<StoryResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        return mapStoryToResponseDTO(story as Story);
    }

    async updateStory(storyId: string, storyData: UpdateStoryDTO) {
        const story = await this.storyRepository.updateStory(storyId, storyData);
        return mapStoryToResponseDTO(story as Story);
    }

    async deleteStory(storyId: string): Promise<void> {
        await this.storyRepository.softDelete(storyId);
    }
}
