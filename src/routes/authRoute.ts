import express from 'express';
import { container } from '../container';
import { AuthController } from '../controllers/authController';
import { validateRequestBody } from '../middlewares/validateRequest';
import {
    SignupSchema,
    LoginSchema,
    ResendConfirmationEmailSchema,
    ValidateCodeSchema,
    UpdatePasswordWithTokenSchema,
} from '../dto/authDTO';
import { authLimiter, emailLimiter } from '../middlewares/rateLimiter';
import { authentication } from '../middlewares/authentication';
import { checkRequiredRoles, updateAuthAuthorization } from '../middlewares/authorization';
import { UserRole } from '../enums';

const authRouter = express.Router();
const authController = container.resolve(AuthController);

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
    )
    .post(
        '/change-password',
        authentication(),
        checkRequiredRoles([UserRole.USER]),
        updateAuthAuthorization(),
        authController.changePassword,
    )
    .post(
        '/validate-code',
        authentication(),
        checkRequiredRoles([UserRole.USER]),
        updateAuthAuthorization(),
        validateRequestBody(ValidateCodeSchema),
        authController.validateCode,
    )
    .post(
        '/update-password',
        authentication(),
        checkRequiredRoles([UserRole.USER]),
        updateAuthAuthorization(),
        validateRequestBody(UpdatePasswordWithTokenSchema),
        authController.updatePassword,
    );

export default authRouter;
