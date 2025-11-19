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
    async findById(userId: string) {
        return this.userRepository.findOne({ where: {id: parseInt(userId)}});
    }
    async update(userId: string, userData: Partial<User>) {
        await this.userRepository.update(parseInt(userId), userData);
        return this.findById(userId);
    }
    async softDelete(userId: string) {
        const result = await this.userRepository.softDelete(parseInt(userId));
        return result.affected && result.affected > 0;
    }
}