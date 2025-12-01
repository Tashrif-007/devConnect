import express from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequestBody } from '../middlewares/validateRequest';
import { SignupSchema } from '../dto/authDTO';

const authRouter = express.Router();
const authController = new AuthController();

authRouter
    .post('/signup', validateRequestBody(SignupSchema), authController.signup)
    .post('/login', authController.login);

export default authRouter;
