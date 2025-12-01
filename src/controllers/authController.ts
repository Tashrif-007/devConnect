import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { AUTH_RESPONSE_MESSAGES } from '../constants/messages';
import { LoginDTO } from '../dto/authDTO';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

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
}
