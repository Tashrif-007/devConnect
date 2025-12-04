import express from 'express';
import { UserController } from '../controllers/userController';
import {
    validateRequestBody,
    validateRequestParams,
    validateRequestQuery,
} from '../middlewares/validateRequest';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserIdParamSchema,
} from '../dto/userDTO';
import { PaginationQuerySchema } from '../dto/paginationDTO';

const userRouter = express.Router();
const userController = new UserController();

userRouter.post(
    '/',
    validateRequestBody(CreateUserSchema),
    userController.createUser,
);
userRouter.get(
    '/',
    validateRequestQuery(PaginationQuerySchema),
    userController.getAllUsers,
);
userRouter.get(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    userController.getUserById,
);
userRouter.put(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    validateRequestBody(UpdateUserSchema),
    userController.updateUser,
);
userRouter.delete(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    userController.deleteUser,
);

export default userRouter;
