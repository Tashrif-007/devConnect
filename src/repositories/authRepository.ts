import { AppDataSource } from '../config/dataSource';
import { authDTO } from '../dto/authDTO';
import { Auth } from '../entity/authEntity';

export class AuthRepository {
    private authRepository = AppDataSource.getRepository(Auth);

    async create(authData: authDTO) {
        const auth = this.authRepository.create({
            userId: authData.userId,
            password: authData.hashedPassword,
        });
        return this.authRepository.save(auth);
    }

    async findByUserId(userId: string) {
        return this.authRepository.findOne({
            where: { userId },
        });
    }

    async updatePassword(userId: string, hashedPassword: string) {
        return this.authRepository.update(
            { userId },
            { password: hashedPassword },
        );
    }

    async deleteByUserId(userId: string) {
        return this.authRepository.delete({ userId });
    }
}
