import 'reflect-metadata';
import { CategoryService } from '../services/categoryService';
import { CategoryRepository } from '../repositories/categoryRepository';
import { CategoryDTO, CategoryResponseDTO } from '../dto/categoryDTO';
import { Category } from '../entity/categoryEntity';
import { CATEGORY_RESPONSE_MESSAGES } from '../constants/messages';
import { ConflictError } from '../errors/errors';

jest.mock('../config/dataSource');

describe('CategoryService', () => {
    let categoryService: CategoryService;
    let mockCategoryRepository: jest.Mocked<CategoryRepository>;

    const createMockCategory = (overrides?: Partial<Category>): Category => ({
        categoryId: 'cat-123',
        name: 'Technology',
        description: 'Technology stories',
        createdAt: new Date('2024-01-01'),
        deletedAt: null as any,
        stories: [],
        ...overrides,
    });

    beforeEach(() => {
        mockCategoryRepository = {
            create: jest.fn(),
            getAll: jest.fn(),
            getCategoryById: jest.fn(),
            validateCategoryIds: jest.fn(),
            getInvalidCategoryIds: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<CategoryRepository>;

        categoryService = new CategoryService(mockCategoryRepository);

        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        it('should create a category successfully', async () => {
            const categoryData: CategoryDTO = {
                name: 'Technology',
                description: 'Technology stories',
            };

            const mockCategory = createMockCategory();

            mockCategoryRepository.create.mockResolvedValue(mockCategory);

            const result = await categoryService.createCategory(categoryData);

            expect(mockCategoryRepository.create).toHaveBeenCalledWith(
                categoryData,
            );
            expect(result).toBeInstanceOf(CategoryResponseDTO);
        });
    });

    describe('getAllCategories', () => {
        it('should retrieve all categories', async () => {
            const mockCategories = [
                createMockCategory(),
                createMockCategory({
                    categoryId: 'cat-2',
                    name: 'Development',
                }),
            ];

            mockCategoryRepository.getAll.mockResolvedValue(mockCategories);

            const result = await categoryService.getAllCategories();

            expect(mockCategoryRepository.getAll).toHaveBeenCalled();
            expect(result).toEqual(mockCategories);
        });

        it('should return empty array when no categories exist', async () => {
            mockCategoryRepository.getAll.mockResolvedValue([]);

            const result = await categoryService.getAllCategories();

            expect(result).toEqual([]);
        });
    });

    describe('getCategoryById', () => {
        it('should retrieve a category by ID', async () => {
            const categoryId = 'cat-123';
            const mockCategory = createMockCategory();

            mockCategoryRepository.getCategoryById.mockResolvedValue(
                mockCategory,
            );

            const result = await categoryService.getCategoryById(categoryId);

            expect(mockCategoryRepository.getCategoryById).toHaveBeenCalledWith(
                categoryId,
            );
            expect(result).toEqual(mockCategory);
        });
    });

    describe('validateCategoryIds', () => {
        it('should validate category IDs successfully', async () => {
            const categoryIds = ['cat-1', 'cat-2'];

            mockCategoryRepository.validateCategoryIds.mockResolvedValue(true);

            const result =
                await categoryService.validateCategoryIds(categoryIds);

            expect(
                mockCategoryRepository.validateCategoryIds,
            ).toHaveBeenCalledWith(categoryIds);
            expect(result).toBe(true);
        });

        it('should return false for invalid category IDs', async () => {
            const categoryIds = ['invalid-cat-1'];

            mockCategoryRepository.validateCategoryIds.mockResolvedValue(false);

            const result =
                await categoryService.validateCategoryIds(categoryIds);

            expect(result).toBe(false);
        });
    });

    describe('getInvalidCategoryIds', () => {
        it('should return empty array for valid category IDs', async () => {
            const categoryIds = ['cat-1', 'cat-2'];

            mockCategoryRepository.getInvalidCategoryIds.mockResolvedValue([]);

            const result =
                await categoryService.getInvalidCategoryIds(categoryIds);

            expect(
                mockCategoryRepository.getInvalidCategoryIds,
            ).toHaveBeenCalledWith(categoryIds);
            expect(result).toEqual([]);
        });

        it('should return invalid category IDs', async () => {
            const categoryIds = ['cat-1', 'invalid-cat-2'];

            mockCategoryRepository.getInvalidCategoryIds.mockResolvedValue([
                'invalid-cat-2',
            ]);

            const result =
                await categoryService.getInvalidCategoryIds(categoryIds);

            expect(result).toEqual(['invalid-cat-2']);
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category successfully', async () => {
            const categoryId = 'cat-123';

            mockCategoryRepository.delete.mockResolvedValue({
                affected: 1,
                raw: {},
                generatedMaps: [],
            });

            await categoryService.deleteCategory(categoryId);

            expect(mockCategoryRepository.delete).toHaveBeenCalledWith(
                categoryId,
            );
        });

        it('should throw ConflictError when category not found', async () => {
            const categoryId = 'nonexistent-cat';

            mockCategoryRepository.delete.mockResolvedValue({
                affected: 0,
                raw: {},
                generatedMaps: [],
            });

            await expect(
                categoryService.deleteCategory(categoryId),
            ).rejects.toThrow(ConflictError);
            await expect(
                categoryService.deleteCategory(categoryId),
            ).rejects.toThrow(CATEGORY_RESPONSE_MESSAGES.NOT_FOUND);
        });
    });
});
