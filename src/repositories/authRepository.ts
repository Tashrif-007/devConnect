import { AppDataSource } from '../config/dataSource';
import { authDTO } from '../dto/authDTO';
import { Auth } from '../entity/authEntity';
import { databaseContext } from '../utils/databaseContext';

export class AuthRepository {
    private authRepository = AppDataSource.getRepository(Auth);

    async create(authData: authDTO) {
        const entityManager = databaseContext.getEntityManager();
        const manager = entityManager || this.authRepository.manager;
        const auth = manager.create(Auth, {
            userId: authData.userId,
            password: authData.hashedPassword,
        });
        return manager.save(auth);
    }

    async findByUserId(userId: string) {
        return this.authRepository.findOne({
            where: { userId },
        });
    }

    async updatePassword(userId: string, hashedPassword: string) {
        const entityManager = databaseContext.getEntityManager();
        const manager = entityManager || this.authRepository.manager;
        return manager.update(Auth, { userId }, { password: hashedPassword });
    }

    async deleteByUserId(userId: string) {
        return this.authRepository.delete({ userId });
    }
}
