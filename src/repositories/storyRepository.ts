import { AppDataSource } from '../config/dataSource';
import { Story } from '../entity/storyEntity';
import { Category } from '../entity/categoryEntity';
import { CreateStoryDTO, UpdateStoryDTO } from '../dto/storyDTO';
import { UpdateResult } from 'typeorm';
import { SortDirection, StoryOrderBy } from '../enums';

export class StoryRepository {
    private storyRepository = AppDataSource.getRepository(Story);

    async create(storyData: CreateStoryDTO): Promise<Story> {
        const { categoryIds, ...storyPayload } = storyData;
        const story = this.storyRepository.create(storyPayload);
        const savedStory = await this.storyRepository.save(story);

        if (categoryIds && categoryIds.length > 0) {
            await this.storyRepository
                .createQueryBuilder()
                .relation(Story, 'categories')
                .of(savedStory)
                .add(categoryIds);
        }

        const reloadedStory = await this.findById(savedStory.storyId);
        return reloadedStory || savedStory;
    }

    async findAll(
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: StoryOrderBy = StoryOrderBy.CREATED_AT,
        categoryName?: string,
    ): Promise<{ data: Story[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        let query = this.storyRepository
            .createQueryBuilder('story')
            .leftJoinAndSelect('story.user', 'user');

        if (categoryName) {
            query = query
                .innerJoinAndSelect('story.categories', 'categories')
                .where('categories.name ILIKE :categoryName', {
                    categoryName: `%${categoryName}%`,
                });
        } else {
            query = query.leftJoinAndSelect('story.categories', 'categories');
        }

        query = query.orderBy(orderBy, sortBy).skip(offset).take(itemsPerPage);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async search(
        searchTerm: string,
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: StoryOrderBy = StoryOrderBy.CREATED_AT,
        categoryName?: string,
    ): Promise<{ data: Story[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        let query = this.storyRepository
            .createQueryBuilder('story')
            .leftJoinAndSelect('story.user', 'user')
            .where('story.title ILIKE :find', { find: `%${searchTerm}%` })
            .orWhere('story.body ILIKE :find', { find: `%${searchTerm}%` })
            .orWhere('user.name ILIKE :find', { find: `%${searchTerm}%` });

        if (categoryName) {
            query = query
                .innerJoinAndSelect('story.categories', 'categories')
                .andWhere('categories.name ILIKE :categoryName', {
                    categoryName: `%${categoryName}%`,
                });
        } else {
            query = query.leftJoinAndSelect('story.categories', 'categories');
        }

        query = query.orderBy(orderBy, sortBy).skip(offset).take(itemsPerPage);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async findById(storyId: string): Promise<Story | null> {
        return this.storyRepository.findOne({
            where: { storyId },
            relations: ['user', 'categories'],
        });
    }

    async updateStory(
        storyId: string,
        storyData: UpdateStoryDTO,
    ): Promise<Story | null> {
        const { categoryIds, ...updatePayload } = storyData as Record<
            string,
            unknown
        >;

        await this.updateStoryFields(storyId, updatePayload);

        if (
            categoryIds &&
            Array.isArray(categoryIds) &&
            categoryIds.length > 0
        ) {
            await this.updateStoryCategories(storyId, categoryIds);
        }

        return this.findById(storyId);
    }

    private async updateStoryFields(
        storyId: string,
        updatePayload: Record<string, unknown>,
    ): Promise<void> {
        if (Object.keys(updatePayload).length > 0) {
            await this.storyRepository.update(storyId, updatePayload);
        }
    }

    private async updateStoryCategories(
        storyId: string,
        newCategoryIds: string[],
    ): Promise<void> {
        const existingCategories = await this.getExistingCategories(storyId);

        if (existingCategories.length > 0) {
            await this.removeCategories(storyId, existingCategories);
        }

        await this.addCategories(storyId, newCategoryIds);
    }

    private async getExistingCategories(storyId: string): Promise<Category[]> {
        return this.storyRepository
            .createQueryBuilder()
            .relation(Story, 'categories')
            .of(storyId)
            .loadMany();
    }

    private async removeCategories(
        storyId: string,
        categoriesToRemove: Category[],
    ): Promise<void> {
        const story = await this.storyRepository.findOne({
            where: { storyId },
        });

        if (story) {
            await this.storyRepository
                .createQueryBuilder()
                .relation(Story, 'categories')
                .of(story)
                .remove(categoriesToRemove);
        }
    }

    private async addCategories(
        storyId: string,
        categoryIds: string[],
    ): Promise<void> {
        await this.storyRepository
            .createQueryBuilder()
            .relation(Story, 'categories')
            .of(storyId)
            .add(categoryIds);
    }

    async softDelete(storyId: string): Promise<UpdateResult> {
        return this.storyRepository.softDelete(storyId);
    }
}
