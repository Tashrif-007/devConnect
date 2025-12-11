import { StoryRepository } from '../repositories/storyRepository';
import { CategoryService } from './categoryService';
import {
    CreateStoryDTO,
    StoryResponseDTO,
    UpdateStoryDTO,
} from '../dto/storyDTO';
import { Story } from '../entity/storyEntity';
import { ERROR_MESSAGES, STORY_RESPONSE_MESSAGES } from '../constants/messages';
import {
    PaginatedResponseDTO,
    PaginationQuery,
    createPaginatedResponse,
} from '../dto/paginationDTO';
import { SortDirection, StoryOrderBy } from '../enums';
import {
    NotFoundError,
    OpenRouterError,
    ValidationError,
} from '../errors/errors';
import { AiService } from './aiService';
import { HttpStatus } from '../constants/httpStatus';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

@injectable()
export class StoryService {
    constructor(
        private storyRepository: StoryRepository,
        private categoryService: CategoryService,
        private aiService: AiService,
    ) {}

    private ensureExists(story: Story | null): Story {
        if (!story) {
            throw new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return story;
    }

    async createStory(storyData: CreateStoryDTO): Promise<StoryResponseDTO> {
        if (storyData.categoryIds && storyData.categoryIds.length > 0) {
            const invalidCategoryIds =
                await this.categoryService.getInvalidCategoryIds(
                    storyData.categoryIds,
                );

            if (invalidCategoryIds.length > 0) {
                throw new ValidationError(ERROR_MESSAGES.INVALID_CATEGORY_ID);
            }
        }

        if (!storyData.skip) {
            try {
                storyData.summary = await this.aiService.summarize(
                    storyData.body,
                );
            } catch (error) {
                storyData.summary = undefined;
            }
        }
        const story = await this.storyRepository.create(storyData);
        return StoryResponseDTO.fromEntity(story);
    }

    async getAllStories(
        paginationDTO: PaginationQuery,
    ): Promise<PaginatedResponseDTO<StoryResponseDTO>> {
        paginationDTO.page = paginationDTO.page || 1;
        paginationDTO.itemsPerPage = paginationDTO.itemsPerPage || 10;
        paginationDTO.sortBy = paginationDTO.sortBy || SortDirection.DESC;
        paginationDTO.orderBy =
            paginationDTO.orderBy || StoryOrderBy.CREATED_AT;

        const result = paginationDTO.find
            ? await this.storyRepository.search(paginationDTO)
            : await this.storyRepository.findAll(paginationDTO);

        const stories = StoryResponseDTO.fromEntities(result.data);
        return createPaginatedResponse(
            stories,
            result.total,
            paginationDTO.page,
            paginationDTO.itemsPerPage,
        );
    }

    async getStoryById(storyId: string): Promise<StoryResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        this.ensureExists(story);
        return StoryResponseDTO.fromEntity(story!);
    }

    async updateStory(storyId: string, storyData: UpdateStoryDTO) {
        if (storyData.categoryIds && storyData.categoryIds.length > 0) {
            const invalidCategoryIds =
                await this.categoryService.getInvalidCategoryIds(
                    storyData.categoryIds,
                );

            if (invalidCategoryIds.length > 0) {
                throw new ValidationError(ERROR_MESSAGES.INVALID_CATEGORY_ID);
            }
        }
        if (storyData.body) {
            try {
                storyData.summary = await this.aiService.summarize(
                    storyData.body,
                );
            } catch (error) {
                storyData.summary = undefined;
            }
        }
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

    async regenerateSummary(storyId: string): Promise<StoryResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        this.ensureExists(story);

        try {
            const summary = await this.aiService.summarize(story!.body);
            story!.summary = summary;
            const updatedStory = await this.storyRepository.updateStory(
                storyId,
                {
                    summary,
                },
            );
            this.ensureExists(updatedStory);
            return StoryResponseDTO.fromEntity(updatedStory!);
        } catch (error) {
            throw new OpenRouterError(
                ERROR_MESSAGES.BAD_GATEWAY,
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
