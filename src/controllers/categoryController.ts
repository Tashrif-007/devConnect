import { NextFunction, Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { CategoryDTO, CategoryResponseDTO } from '../dto/categoryDTO';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { CATEGORY_RESPONSE_MESSAGES } from '../constants/messages';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    createCategory = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const categoryData: CategoryDTO = req.body;
            const category: CategoryResponseDTO =
                await this.categoryService.createCategory(categoryData);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    category,
                    CATEGORY_RESPONSE_MESSAGES.CREATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getAllCategories = async (
        _req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    categories,
                    CATEGORY_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    deleteCategory = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            await this.categoryService.deleteCategory(req.params.categoryId);
            res.sendStatus(HttpStatus.NO_CONTENT);
        } catch (error) {
            next(error);
        }
    };
}
