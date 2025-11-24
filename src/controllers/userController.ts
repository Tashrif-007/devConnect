import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';
import { USER_RESPONSE_MESSAGES } from '../constants/messages';
import { AppError, NotFoundError, ConflictError } from '../errors';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    try {
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
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
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
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
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
    try {
      await this.userService.deleteUser(req.params.userId);
      res.status(HttpStatus.NO_CONTENT).send();
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
        .json(ResponseFormatter.error(USER_RESPONSE_MESSAGES.DELETE_FAILED));
    }
  };
}
