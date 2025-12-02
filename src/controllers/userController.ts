import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { UserResponseDTO } from '../dto/userDTO';
import { PaginatedResponseDTO, PaginationQuery } from '../dto/paginationDTO';
import { authenticatedRequest } from '../middlewares/authentication';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: UserResponseDTO = await this.userService.createUser(
                req.body,
            );
            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.CREATED),
            );
        } catch (error) {
            next(error);
        }
    };

    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paginationQuery: PaginationQuery =
                req.query as unknown as PaginationQuery;
            const result: PaginatedResponseDTO<UserResponseDTO> =
                await this.userService.getAllUsers(paginationQuery);
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    USER_RESPONSE_MESSAGES.ALL_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: UserResponseDTO = await this.userService.getUserById(
                req.params.userId,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    user,
                    USER_RESPONSE_MESSAGES.RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: UserResponseDTO = await this.userService.updateUser(
                req.params.userId,
                req.body,
            );
            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.UPDATED),
            );
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.deleteUser(req.params.userId);
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    };
}
