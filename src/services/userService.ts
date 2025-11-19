import { User } from "../entity/userEntity";
import { UserRepository } from "../repositories/userRepository";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(userData: User) {
        return this.userRepository.create(userData);
    }
    async getAllUsers() {
        return this.userRepository.findAll();
    }
    async getUserById(userId: string) {
        const user = await this.userRepository.findById(parseInt(userId));
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(userId: string, userData: Partial<User>) {
        return this.userRepository.update(parseInt(userId), userData);
    }
    async deleteUser(userId: string) {
        return this.userRepository.softDelete(parseInt(userId));
    }
}