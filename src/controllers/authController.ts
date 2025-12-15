import { injectable } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { AUTH_RESPONSE_MESSAGES } from '../constants/messages';
import { LoginDTO } from '../dto/authDTO';
import { authenticatedRequest } from '../middlewares/authentication';

@injectable()
export class AuthController {
    constructor(private authService: AuthService) {}

    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const signupData = req.body;
            const result = await this.authService.signup(signupData);
            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(
                    result,
                    AUTH_RESPONSE_MESSAGES.SIGNUP_SUCCESS,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const loginData: LoginDTO = req.body;
            const result = await this.authService.login(loginData);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    AUTH_RESPONSE_MESSAGES.LOGIN_SUCCESS,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.params;
            const result = await this.authService.confirmEmail(token);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    AUTH_RESPONSE_MESSAGES.EMAIL_CONFIRMED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    resendConfirmationEmail = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { email } = req.body;
            const result =
                await this.authService.resendConfirmationEmail(email);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    AUTH_RESPONSE_MESSAGES.CONFIRMATION_EMAIL_RESENT,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { password } = req.body;
            const userId = (req as authenticatedRequest).decoded?.userId;
            await this.authService.changePassword(userId!, password);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    null,
                    AUTH_RESPONSE_MESSAGES.PASSWORD_CHANGE_REQUESTED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    validateCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { confirmationCode } = req.body;
            const userId = (req as authenticatedRequest).decoded?.userId;
            const result = await this.authService.validateCode(
                userId!,
                confirmationCode,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    AUTH_RESPONSE_MESSAGES.CODE_VALIDATED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    updatePassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { newPassword, sessionToken } = req.body;
            const userId = (req as authenticatedRequest).decoded?.userId;
            const result = await this.authService.updatePassword(
                userId!,
                newPassword,
                sessionToken,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(result, result.message),
            );
        } catch (error) {
            next(error);
        }
    };
}
