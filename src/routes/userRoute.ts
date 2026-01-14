import express from 'express';
import { UserController } from '../controllers/userController';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
import {
    UpdateUserSchema,
    UpdateProfileSchema,
    UserIdParamSchema,
} from '../dto/userDTO';
import { PaginationQuerySchema } from '../dto/paginationDTO';
import { authentication } from '../middlewares/authentication';
import {
    userUpdateDeleteAuthorization,
    checkRequiredRoles,
} from '../middlewares/authorization';
import { uploadSingleImage } from '../config/multer';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { UserRole } from '../enums';
import { container } from 'tsyringe';

const userRouter = express.Router();
const userController = container.resolve(UserController);

userRouter.get(
    '/profile',
    readLimiter,
    authentication(),
    checkRequiredRoles([UserRole.ADMIN, UserRole.USER]),
    userController.getProfile,
);
userRouter.put(
    '/profile',
    writeLimiter,
    uploadSingleImage,
    validateRequestBody(UpdateProfileSchema),
    authentication(),
    checkRequiredRoles([UserRole.ADMIN, UserRole.USER]),
    userController.updateProfile,
);
userRouter.get(
    '/',
    readLimiter,
    validateRequestQuery(PaginationQuerySchema),
    userController.getAllUsers,
);
userRouter.get(
    '/:userId',
    readLimiter,
    validateRequestParams(UserIdParamSchema),
    userController.getUserById,
);
userRouter.put(
    '/:userId',
    writeLimiter,
    validateRequestParams(UserIdParamSchema),
    validateRequestBody(UpdateUserSchema),
    authentication(),
    userUpdateDeleteAuthorization(),
    userController.updateUser,
);
userRouter.delete(
    '/:userId',
    writeLimiter,
    validateRequestParams(UserIdParamSchema),
    authentication(),
    userUpdateDeleteAuthorization(),
    userController.deleteUser,
);

export default userRouter;
