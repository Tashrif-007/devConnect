<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
=======
import { Request, Response } from 'express';
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)
import { UserService } from '../services/userService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
<<<<<<< HEAD
import { UserResponseDTO } from '../dto/userDTO';
=======
import { AppError, NotFoundError, ConflictError } from '../errors';
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)



export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
<<<<<<< HEAD
      const user: UserResponseDTO = await this.userService.createUser(req.body);
      res.status(HttpStatus.CREATED).json(ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.CREATED));
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users: UserResponseDTO[] = await this.userService.getAllUsers();
      res.status(HttpStatus.OK).json(
        ResponseFormatter.success(users, USER_RESPONSE_MESSAGES.ALL_RETRIEVED)
      );
    } catch (error) {
      next(error);
=======
      const user = await this.userService.createUser(req.body);
      res.status(HttpStatus.CREATED).json(ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.CREATED));
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(error.statusCode).json(ResponseFormatter.error(error.message));
      }
      if (error instanceof AppError) {
        return res.status(error.statusCode).json(ResponseFormatter.error(error.message));
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.CREATION_FAILED));
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
<<<<<<< HEAD
      const user: UserResponseDTO = await this.userService.getUserById(req.params.userId);
      res.status(HttpStatus.OK).json(ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.RETRIEVED));
    } catch (error) {
      next(error);
=======
      const users = await this.userService.getAllUsers();
      res
        .status(HttpStatus.OK)
        .json(
          ResponseFormatter.success(users, USER_RESPONSE_MESSAGES.RETRIEVED),
        );
    } catch (error) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.FETCH_ALL_FAILED));
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
<<<<<<< HEAD
      const user: UserResponseDTO = await this.userService.updateUser(req.params.userId, req.body);
      res.status(HttpStatus.OK).json(ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.UPDATED));
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
=======
      const user = await this.userService.getUserById(req.params.userId);
      res
        .status(HttpStatus.OK)
        .json(
          ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.RETRIEVED),
        );
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.FETCH_FAILED));
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.updateUser(
        req.params.userId,
        req.body,
      );
      res
        .status(HttpStatus.OK)
        .json(ResponseFormatter.success(user, USER_RESPONSE_MESSAGES.UPDATED));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.UPDATE_FAILED));
    }
  };

  deleteUser = async (req: Request, res: Response) => {
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)
    try {
      await this.userService.deleteUser(req.params.userId);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
<<<<<<< HEAD
      next(error);
=======
      if (error instanceof NotFoundError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(ResponseFormatter.error(error.message));
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.DELETE_FAILED));
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)
    }
  };
}
