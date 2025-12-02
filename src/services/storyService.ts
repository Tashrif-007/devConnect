import { StoryRepository } from '../repositories/storyRepository';
import {
    CreateStoryDTO,
    StoryResponseDTO,
    UpdateStoryDTO,
} from '../dto/storyDTO';
import { Story } from '../entity/storyEntity';
import { STORY_RESPONSE_MESSAGES } from '../constants/messages';
import {
    PaginatedResponseDTO,
    PaginationQuery,
    createPaginatedResponse,
} from '../dto/paginationDTO';
import { SortDirection, StoryOrderBy } from '../enums';
import { NotFoundError } from '../errors/errors';

export class StoryService {
    private storyRepository: StoryRepository;

    constructor() {
        this.storyRepository = new StoryRepository();
    }

    private ensureExists(story: Story | null): Story {
        if (!story) {
            throw new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return story;
    }

    async createStory(storyData: CreateStoryDTO): Promise<StoryResponseDTO> {
        return this.storyRepository.create(storyData);
    }

    async getAllStories(
        paginationDTO: PaginationQuery,
    ): Promise<PaginatedResponseDTO<StoryResponseDTO>> {
        const page = paginationDTO.page || 1;
        const itemsPerPage = paginationDTO.itemsPerPage || 10;
        const find = paginationDTO.find;
        const sortBy = paginationDTO.sortBy || SortDirection.DESC;
        const orderBy = paginationDTO.orderBy || StoryOrderBy.CREATED_AT;

        const result = find
            ? await this.storyRepository.search(
                  find,
                  page,
                  itemsPerPage,
                  sortBy,
                  orderBy as StoryOrderBy,
              )
            : await this.storyRepository.findAll(
                  page,
                  itemsPerPage,
                  sortBy,
                  orderBy as StoryOrderBy,
              );

        const stories = StoryResponseDTO.fromEntities(result.data);
        return createPaginatedResponse(
            stories,
            result.total,
            page,
            itemsPerPage,
        );
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
            throw new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}
