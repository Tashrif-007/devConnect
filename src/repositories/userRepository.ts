import { AppDataSource } from "../config/dataSource";
import { User } from "../entity/userEntity";

export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);

    async create(userData: User) {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findById(userId: number) {
        return this.userRepository.findOne({ where: {id: userId}});
    }
    async update(userId: number, userData: Partial<User>) {
        await this.userRepository.update(userId, userData);
        return this.findById(userId);
    }
    async softDelete(userId: number) {
        const result = await this.userRepository.softDelete(userId);
        return result.affected && result.affected > 0;
    }
}