import { injectable } from 'tsyringe';
import { AppDataSource } from '../config/dataSource';
import { databaseContext } from '../utils/databaseContext';
import 'reflect-metadata';

@injectable()
export class TransactionRepository {
    async executeInTransaction<T>(callback: () => Promise<T>): Promise<T> {
        return await AppDataSource.transaction(async (entityManager) => {
            return await databaseContext.runWithEntityManager(
                entityManager,
                callback,
            );
        });
    }
}
