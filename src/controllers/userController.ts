import { Request, Response } from 'express';
import { UserService } from "../services/userService";
import { HttpStatus } from '../constants/httpStatus';
import { ResponseFormatter } from '../utils/apiResponse';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(HttpStatus.CREATED).json(
        ResponseFormatter.success(user, 'User created successfully')
      );
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('Failed to create user')
      );
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(HttpStatus.OK).json(
        ResponseFormatter.success(users, 'Users retrieved successfully')
      );
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('Failed to fetch users')
      );
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.userId);
      res.status(HttpStatus.OK).json(
        ResponseFormatter.success(user, 'User retrieved successfully')
      );
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).json(
          ResponseFormatter.error(error.message)
        );
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('Failed to fetch user')
      );
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.updateUser(req.params.userId, req.body);
      res.status(HttpStatus.OK).json(
        ResponseFormatter.success(user, 'User updated successfully')
      );
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).json(
          ResponseFormatter.error(error.message)
        );
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('Failed to update user')
      );
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteUser(req.params.userId);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).json(
          ResponseFormatter.error(error.message)
        );
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('Failed to delete user')
      );
    }
  };
}