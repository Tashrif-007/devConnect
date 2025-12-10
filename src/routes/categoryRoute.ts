import express from 'express';
import { CategoryController } from '../controllers/categoryController';
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/validateRequest';
import { CategoryIdSchema, CategorySchema } from '../dto/categoryDTO';
import { apiLimiter } from '../middlewares/rateLimiter';
import { checkRequiredRoles } from '../middlewares/authorization';
import { UserRole } from '../enums';
import { authentication } from '../middlewares/authentication';

const categoryRouter = express.Router();
const categoryController = new CategoryController();

categoryRouter.post(
    '/',
    apiLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN]),
    validateRequestBody(CategorySchema),
    categoryController.createCategory,
);

categoryRouter.get(
    '/',
    apiLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN, UserRole.USER]),
    categoryController.getAllCategories,
);

categoryRouter.delete(
    '/:categoryId',
    apiLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN]),
    validateRequestParams(CategoryIdSchema),
    categoryController.deleteCategory,
);

export default categoryRouter;
