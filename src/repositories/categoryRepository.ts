import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { CategoryDTO } from '../dto/categoryDTO';
import { Category } from '../entity/categoryEntity';

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

    async delete(categoryId: string): Promise<UpdateResult> {
        return this.categoryRepository.softDelete(categoryId);
    }
}
