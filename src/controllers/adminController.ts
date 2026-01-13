import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { UserResponseDTO } from '../dto/userDTO';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

@injectable()
export class AdminController {

    constructor(private userService: UserService) {}

    updateUserRole = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const user: UserResponseDTO = await this.userService.updateUserRole(
                req.params.userId,
                req.body.role,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.UPDATED),
            );
        } catch (error) {
            next(error);
        }
    };
}
