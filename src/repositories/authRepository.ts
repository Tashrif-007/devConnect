import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/dataSource';
import { authDTO, UpdateAuthDTO } from '../dto/authDTO';
import { Auth } from '../entity/authEntity';
import { DatabaseContextManager } from '../utils/databaseContext';

@injectable()
export class AuthRepository {
    private authRepository = AppDataSource.getRepository(Auth);

    constructor(private databaseContext: DatabaseContextManager) {}

    async create(authData: authDTO) {
        const entityManager = this.databaseContext.getEntityManager();
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
            relations: ['user'],
        });
    }

    async update(updateData: UpdateAuthDTO) {
        const entityManager = this.databaseContext.getEntityManager();
        const manager = entityManager || this.authRepository.manager;
        return manager.update(Auth, { userId: updateData.userId }, updateData);
    }

    async deleteByUserId(userId: string) {
        return this.authRepository.delete({ userId });
    }
}
