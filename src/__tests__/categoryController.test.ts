import 'reflect-metadata';
import { CategoryController } from '../controllers/categoryController';
import { CategoryService } from '../services/categoryService';
import { Request, Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { CATEGORY_RESPONSE_MESSAGES } from '../constants/messages';
import { Category } from '../entity/categoryEntity';
import { ConflictError } from '../errors/errors';
import { TrendingCategoryDTO } from '../dto/categoryDTO';

describe('CategoryController', () => {
    let categoryController: CategoryController;
    let mockCategoryService: jest.Mocked<CategoryService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNextFunction: jest.Mock<void>;

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
        mockCategoryService = {
            createCategory: jest.fn(),
            getAllCategories: jest.fn(),
            deleteCategory: jest.fn(),
            getCategoryById: jest.fn(),
            validateCategoryIds: jest.fn(),
            getInvalidCategoryIds: jest.fn(),
            getTrendingCategories: jest.fn(),
        } as unknown as jest.Mocked<CategoryService>;

        categoryController = new CategoryController(mockCategoryService);

        mockRequest = {
            body: {},
            params: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            sendStatus: jest.fn().mockReturnThis(),
        };

        mockNextFunction = jest.fn();

        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        it('should create a category successfully', async () => {
            const mockCategory = createMockCategory();

            mockRequest.body = {
                name: 'Technology',
                description: 'Technology stories',
            };

            mockCategoryService.createCategory.mockResolvedValue(mockCategory);

            await categoryController.createCategory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
                mockRequest.body,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockCategory,
                    CATEGORY_RESPONSE_MESSAGES.CREATED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on creation failure', async () => {
            const error = new ConflictError(
                CATEGORY_RESPONSE_MESSAGES.NOT_FOUND,
            );

            mockRequest.body = {
                name: 'Technology',
                description: 'Technology stories',
            };

            mockCategoryService.createCategory.mockRejectedValue(error);

            await categoryController.createCategory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('getAllCategories', () => {
        it('should retrieve all categories successfully', async () => {
            const mockCategories = [
                createMockCategory(),
                createMockCategory({
                    categoryId: 'cat-2',
                    name: 'Development',
                }),
            ];

            mockCategoryService.getAllCategories.mockResolvedValue(
                mockCategories,
            );

            await categoryController.getAllCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockCategoryService.getAllCategories).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockCategories,
                    CATEGORY_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should handle empty category list', async () => {
            mockCategoryService.getAllCategories.mockResolvedValue([]);

            await categoryController.getAllCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalled();
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on retrieval failure', async () => {
            const error = new Error('Database error');

            mockCategoryService.getAllCategories.mockRejectedValue(error);

            await categoryController.getAllCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });

    describe('deleteCategory', () => {
        it('should delete a category successfully', async () => {
            const categoryId = 'cat-123';

            mockRequest.params = { categoryId };

            mockCategoryService.deleteCategory.mockResolvedValue(undefined);

            await categoryController.deleteCategory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
                categoryId,
            );
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(
                HttpStatus.NO_CONTENT,
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on deletion failure', async () => {
            const categoryId = 'nonexistent-cat';
            const error = new ConflictError(
                CATEGORY_RESPONSE_MESSAGES.NOT_FOUND,
            );

            mockRequest.params = { categoryId };

            mockCategoryService.deleteCategory.mockRejectedValue(error);

            await categoryController.deleteCategory(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
                categoryId,
            );
            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.sendStatus).not.toHaveBeenCalled();
        });
    });

    describe('getTrendingCategories', () => {
        it('should retrieve trending categories successfully', async () => {
            const mockTrendingCategories: TrendingCategoryDTO[] = [
                {
                    categoryId: 'cat-1',
                    name: 'JavaScript',
                    storyCount: 25,
                } as TrendingCategoryDTO,
                {
                    categoryId: 'cat-2',
                    name: 'React',
                    storyCount: 18,
                } as TrendingCategoryDTO,
                {
                    categoryId: 'cat-3',
                    name: 'TypeScript',
                    storyCount: 12,
                } as TrendingCategoryDTO,
            ];

            mockCategoryService.getTrendingCategories.mockResolvedValue(
                mockTrendingCategories,
            );

            await categoryController.getTrendingCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(
                mockCategoryService.getTrendingCategories,
            ).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    mockTrendingCategories,
                    CATEGORY_RESPONSE_MESSAGES.TRENDING_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should handle empty trending categories list', async () => {
            mockCategoryService.getTrendingCategories.mockResolvedValue([]);

            await categoryController.getTrendingCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                ResponseFormatter.success(
                    [],
                    CATEGORY_RESPONSE_MESSAGES.TRENDING_RETRIEVED,
                ),
            );
            expect(mockNextFunction).not.toHaveBeenCalled();
        });

        it('should pass error to next middleware on retrieval failure', async () => {
            const error = new Error('Database error');

            mockCategoryService.getTrendingCategories.mockRejectedValue(error);

            await categoryController.getTrendingCategories(
                mockRequest as Request,
                mockResponse as Response,
                mockNextFunction,
            );

            expect(mockNextFunction).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
        });
    });
});
