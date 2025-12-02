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
    updateDeleteAuthorization,
    userAuthorization,
} from '../middlewares/authorization';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get(
    '/',
    validateRequestQuery(PaginationQuerySchema),
    authentication(),
    userAuthorization(),
    userController.getAllUsers,
);
userRouter.get(
    '/:userId',
    authentication(),
    userAuthorization(),
    validateRequestParams(UserIdParamSchema),
    userController.getUserById,
);
userRouter.put(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    validateRequestBody(UpdateUserSchema),
    authentication(),
    updateDeleteAuthorization(),
    userController.updateUser,
);
userRouter.delete(
    '/:userId',
    validateRequestParams(UserIdParamSchema),
    authentication(),
    updateDeleteAuthorization(),
    userController.deleteUser,
);

export default userRouter;
