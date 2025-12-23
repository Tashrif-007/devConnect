import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { CategoryDTO } from '../dto/categoryDTO';
import { Category } from '../entity/categoryEntity';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

@injectable()
export class CategoryRepository {
    private categoryRepository = AppDataSource.getRepository(Category);

    async create(categoryData: CategoryDTO): Promise<Category> {
        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }

    async getAll(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async getCategoryById(categoryId: string) {
        return this.categoryRepository.findOneBy({ categoryId });
    }

    async validateCategoryIds(categoryIds: string[]): Promise<boolean> {
        if (!categoryIds || categoryIds.length === 0) {
            return true;
        }

        const foundCategories = await this.categoryRepository.find({
            where: categoryIds.map((id) => ({ categoryId: id })),
        });

        return foundCategories.length === categoryIds.length;
    }

    async getInvalidCategoryIds(categoryIds: string[]): Promise<string[]> {
        if (!categoryIds || categoryIds.length === 0) {
            return [];
        }

        const foundCategories = await this.categoryRepository.find({
            where: categoryIds.map((id) => ({ categoryId: id })),
        });

        const foundIds = new Set(foundCategories.map((c) => c.categoryId));
        return categoryIds.filter((id) => !foundIds.has(id));
    }

    async delete(categoryId: string): Promise<UpdateResult> {
        return this.categoryRepository.softDelete(categoryId);
    }

    async getTrendingCategories(
        limit: number = 5,
    ): Promise<
        Array<{ categoryId: string; name: string; storyCount: number }>
    > {
        const result = await this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect(
                'category.stories',
                'story',
                'story.deletedAt IS NULL',
            )
            .select('category.categoryId', 'categoryId')
            .addSelect('category.name', 'name')
            .addSelect('COUNT(story.storyId)', 'storyCount')
            .where('category.deletedAt IS NULL')
            .groupBy('category.categoryId')
            .addGroupBy('category.name')
            .orderBy('COUNT(story.storyId)', 'DESC')
            .limit(limit)
            .getRawMany();

        return result.map((row) => ({
            categoryId: row.categoryId,
            name: row.name,
            storyCount: parseInt(row.storyCount, 10),
        }));
    }
}
