import express from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequestBody } from '../middlewares/validateRequest';
import {
    SignupSchema,
    LoginSchema,
    ResendConfirmationEmailSchema,
} from '../dto/authDTO';
import { authLimiter, emailLimiter } from '../middlewares/rateLimiter';

const authRouter = express.Router();
const authController = new AuthController();

authRouter
    .post(
        '/signup',
        authLimiter,
        validateRequestBody(SignupSchema),
        authController.signup,
    )
    .post(
        '/login',
        authLimiter,
        validateRequestBody(LoginSchema),
        authController.login,
    )
    .get('/confirm-email/:token', emailLimiter, authController.confirmEmail)
    .post(
        '/resend-confirmation-email',
        emailLimiter,
        validateRequestBody(ResendConfirmationEmailSchema),
        authController.resendConfirmationEmail,
    );

export default authRouter;
