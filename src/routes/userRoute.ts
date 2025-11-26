import express from 'express';
import { UserController } from '../controllers/userController';
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/validateRequest';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserIdParamSchema,
} from '../dto/userDTO';

const userRouter = express.Router();
const userController = new UserController();

userRouter.post(
    '/',
    validateRequestBody(CreateUserSchema),
    userController.createUser,
);
userRouter.get('/', userController.getAllUsers);
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
