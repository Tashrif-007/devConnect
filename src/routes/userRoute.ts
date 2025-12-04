import express from 'express';
import { UserController } from '../controllers/userController';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
import { UpdateUserSchema, UserIdParamSchema } from '../dto/userDTO';
import { PaginationQuerySchema } from '../dto/paginationDTO';
import { authentication } from '../middlewares/authentication';
import {
    userUpdateDeleteAuthorization,
    checkRequiredRoles,
} from '../middlewares/authorization';
import { UserRole } from '../enums';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get(
    '/',
    validateRequestQuery(PaginationQuerySchema),
    authentication(),
    checkRequiredRoles([UserRole.ADMIN, UserRole.USER]),
    userController.getAllUsers,
);
userRouter.get(
    '/:userId',
    authentication(),
    checkRequiredRoles([UserRole.ADMIN, UserRole.USER]),
    validateRequestParams(UserIdParamSchema),
    userController.getUserById,
);
userRouter.put(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    validateRequestBody(UpdateUserSchema),
    authentication(),
    userUpdateDeleteAuthorization(),
    userController.updateUser,
);
userRouter.delete(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    authentication(),
    userUpdateDeleteAuthorization(),
    userController.deleteUser,
);

export default userRouter;
