import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';
import 'reflect-metadata'
import { injectable } from 'tsyringe';

@injectable()
export class DatabaseContextManager {
    private entityManagerStorage = new AsyncLocalStorage<EntityManager>();

    getEntityManager(): EntityManager | undefined {
        return this.entityManagerStorage.getStore();
    }

    async runWithEntityManager<T>(
        entityManager: EntityManager,
        callback: () => Promise<T>,
    ): Promise<T> {
        return this.entityManagerStorage.run(entityManager, callback);
    }
}

export const databaseContext = new DatabaseContextManager();
