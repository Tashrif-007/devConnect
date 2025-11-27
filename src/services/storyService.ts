import { StoryRepository } from '../repositories/storyRepository';
import {
    CreateStoryDTO,
    StoryResponseDTO,
    UpdateStoryDTO,
} from '../dto/storyDTO';
import { Story } from '../entity/storyEntity';
import { ErrorFactory } from '../errors/errorFactory';
import { STORY_RESPONSE_MESSAGES } from '../constants/messages';

export class StoryService {
    private storyRepository: StoryRepository;

    constructor() {
        this.storyRepository = new StoryRepository();
    }

    private ensureExists(story: Story | null): Story {
        if (!story) {
            throw ErrorFactory.notFound(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return story;
    }

    async createStory(storyData: CreateStoryDTO): Promise<StoryResponseDTO> {
        return this.storyRepository.create(storyData);
    }

    async getAllStories(): Promise<StoryResponseDTO[]> {
        const stories = await this.storyRepository.findAll();
        return StoryResponseDTO.fromEntities(stories);
    }

    async getStoryById(storyId: string): Promise<StoryResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        this.ensureExists(story);
        return StoryResponseDTO.fromEntity(story!);
    }

    async updateStory(storyId: string, storyData: UpdateStoryDTO) {
        const story = await this.storyRepository.updateStory(
            storyId,
            storyData,
        );
        this.ensureExists(story);
        return StoryResponseDTO.fromEntity(story!);
    }

    async deleteStory(storyId: string): Promise<void> {
        const result = await this.storyRepository.softDelete(storyId);
        if (!result.affected) {
            throw ErrorFactory.notFound(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}
