import { Request, Response } from 'express';
import { User } from "../entity/userEntity";
import { UserService } from "../services/userService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const userData: User = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json({
        message: "User created Successfully",
        user: user
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create user"
      });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.userId);
      res.status(200).json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userData: User = req.body;
      const user = await this.userService.updateUser(req.params.userId, userData);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.deleteUser(req.params.userId);
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
}