import { StoryRepository } from '../repositories/storyRepository';
import { VoteService } from './voteService';
import { CommentService } from './commentService';
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
        private voteService: VoteService,
        private commentService: CommentService,
        private categoryService: CategoryService,
        private aiService: AiService,
    ) {}

    private ensureExists(story: Story | null): Story {
        if (!story) {
            throw new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
        return story;
    }

    private async enrichStoryWithVotesAndComments(
        story: Story,
        userId?: string,
    ): Promise<StoryResponseDTO> {
        const voteStats = userId
            ? await this.voteService.getVoteStatsOnly(userId, story.storyId)
            : { upvotes: 0, downvotes: 0, userVote: null };
        const comments = await this.commentService.getCommentsByStoryOnly(
            story.storyId,
            1,
            10,
        );
        const enrichedData = {
            ...story,
            votes: voteStats,
            comments,
        };
        return StoryResponseDTO.fromEntity(enrichedData);
    }

    async createStory(
        storyData: CreateStoryDTO,
        userId?: string,
    ): Promise<StoryResponseDTO> {
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
            } catch {
                storyData.summary = undefined;
            }
        }
        const story = await this.storyRepository.create(storyData);
        return this.enrichStoryWithVotesAndComments(story, userId);
    }

    async getAllStories(
        paginationDTO: PaginationQuery,
        userId?: string,
    ): Promise<PaginatedResponseDTO<StoryResponseDTO>> {
        paginationDTO.page = paginationDTO.page || 1;
        paginationDTO.itemsPerPage = paginationDTO.itemsPerPage || 10;
        paginationDTO.sortBy = paginationDTO.sortBy || SortDirection.DESC;
        paginationDTO.orderBy =
            paginationDTO.orderBy || StoryOrderBy.CREATED_AT;

        const result = paginationDTO.find
            ? await this.storyRepository.search(paginationDTO)
            : await this.storyRepository.findAll(paginationDTO);

        const enrichedStories = await Promise.all(
            result.data.map((story: Story) =>
                this.enrichStoryWithVotesAndComments(story, userId),
            ),
        );

        return createPaginatedResponse(
            enrichedStories,
            result.total,
            paginationDTO.page,
            paginationDTO.itemsPerPage,
        );
    }

    async getStoryById(
        storyId: string,
        userId?: string,
    ): Promise<StoryResponseDTO> {
        const story = await this.storyRepository.findById(storyId);
        this.ensureExists(story);
        return this.enrichStoryWithVotesAndComments(story!, userId);
    }

    async getStoriesByUserId(
        userId: string,
    ): Promise<PaginatedResponseDTO<StoryResponseDTO>> {
        const result = await this.storyRepository.findByUserId(userId);

        const enrichedStories = await Promise.all(
            result.map((story: Story) =>
                this.enrichStoryWithVotesAndComments(story),
            ),
        );

        // Return paginated response with all stories (no pagination for user stories)
        return createPaginatedResponse(
            enrichedStories,
            enrichedStories.length,
            1,
            enrichedStories.length,
        );
    }

    async updateStory(
        storyId: string,
        storyData: UpdateStoryDTO,
        userId?: string,
    ) {
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
            } catch {
                storyData.summary = undefined;
            }
        }
        const story = await this.storyRepository.updateStory(
            storyId,
            storyData,
        );
        this.ensureExists(story);
        return this.enrichStoryWithVotesAndComments(story!, userId);
    }

    async deleteStory(storyId: string): Promise<void> {
        const result = await this.storyRepository.softDelete(storyId);
        if (!result.affected) {
            throw new NotFoundError(STORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }

    async regenerateSummary(
        storyId: string,
        userId?: string,
    ): Promise<StoryResponseDTO> {
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
            return this.enrichStoryWithVotesAndComments(updatedStory!, userId);
        } catch {
            throw new OpenRouterError(
                ERROR_MESSAGES.BAD_GATEWAY,
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
