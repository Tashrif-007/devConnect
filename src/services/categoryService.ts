import { CATEGORY_RESPONSE_MESSAGES } from '../constants/messages';
import { CategoryDTO, CategoryResponseDTO } from '../dto/categoryDTO';
import { ConflictError } from '../errors/errors';
import { CategoryRepository } from '../repositories/categoryRepository';

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async createCategory(categoryData: CategoryDTO) {
        const category = await this.categoryRepository.create(categoryData);
        return CategoryResponseDTO.fromEntity(category);
    }

    async getAllCategories() {
        return this.categoryRepository.getAll();
    }

    async getCategoryById(categoryId: string) {
        return this.categoryRepository.getCategoryById(categoryId);
    }

    async deleteCategory(categoryId: string) {
        const result = await this.categoryRepository.delete(categoryId);
        if (!result.affected) {
            throw new ConflictError(CATEGORY_RESPONSE_MESSAGES.NOT_FOUND);
        }
    }
}
