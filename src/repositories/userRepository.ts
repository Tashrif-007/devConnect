import { AppDataSource } from '../config/dataSource';
import { User } from '../entity/userEntity';
import { CreateUserDTO, UpdateUserDTO } from '../dto/userDTO';
import { SortDirection, UserOrderBy } from '../enums';
import { UpdateResult } from 'typeorm';
import { databaseContext } from '../utils/databaseContext';

export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);

    async create(userData: CreateUserDTO): Promise<User> {
        const entityManager = databaseContext.getEntityManager();
        const manager = entityManager || this.userRepository.manager;
        const user = manager.create(User, userData);
        return manager.save(user);
    }

    async findAll(
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: UserOrderBy = UserOrderBy.USER_ID,
    ): Promise<{ data: User[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        const query = this.userRepository
            .createQueryBuilder('user')
            .orderBy(orderBy, sortBy)
            .skip(offset)
            .take(itemsPerPage);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    async search(
        find: string,
        page: number,
        itemsPerPage: number,
        sortBy: SortDirection = SortDirection.DESC,
        orderBy: UserOrderBy = UserOrderBy.USER_ID,
    ): Promise<{ data: User[]; total: number }> {
        const offset = (page - 1) * itemsPerPage;

        const query = this.userRepository
            .createQueryBuilder('user')
            .where(
                `user.name ILIKE :find
                OR user.email ILIKE :find
                OR user.username ILIKE :find`,
                { find: `%${find}%` },
            )
            .orderBy(orderBy, sortBy)
            .skip(offset)
            .take(itemsPerPage);

        const [data, total] = await query.getManyAndCount();

        return { data, total };
    }

    async findById(userId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { userId } });
    }
    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }
    async update(
        userId: string,
        userData: UpdateUserDTO,
    ): Promise<User | null> {
        await this.userRepository.update(userId, userData);
        return this.findById(userId);
    }
    async softDelete(userId: string): Promise<UpdateResult> {
        const result = await this.userRepository.softDelete(userId);
        return result;
    }
}
