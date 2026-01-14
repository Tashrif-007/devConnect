import express from 'express';
import { CategoryController } from '../controllers/categoryController';
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/validateRequest';
import { CategoryIdSchema, CategorySchema } from '../dto/categoryDTO';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { checkRequiredRoles } from '../middlewares/authorization';
import { UserRole } from '../enums';
import { authentication } from '../middlewares/authentication';
import { container } from 'tsyringe';

const categoryRouter = express.Router();
const categoryController = container.resolve(CategoryController);

categoryRouter.post(
    '/',
    writeLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN]),
    validateRequestBody(CategorySchema),
    categoryController.createCategory,
);

categoryRouter.get('/', readLimiter, categoryController.getAllCategories);

categoryRouter.delete(
    '/:categoryId',
    writeLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN]),
    validateRequestParams(CategoryIdSchema),
    categoryController.deleteCategory,
);

export default categoryRouter;
