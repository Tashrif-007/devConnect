import express from 'express';
import { UserController } from '../controllers/userController';
import { validateRequest } from '../middlewares/validateRequest';
import { CreateUserSchema, UpdateUserSchema } from '../dto/userDTO';

const userRouter = express.Router();
const userController = new UserController();

userRouter.post('/', validateRequest(CreateUserSchema), userController.createUser);
userRouter.get('/', userController.getAllUsers);
userRouter.get('/:userId', userController.getUserById);
userRouter.put('/:userId', validateRequest(UpdateUserSchema), userController.updateUser);
userRouter.delete('/:userId', userController.deleteUser);

export default userRouter;