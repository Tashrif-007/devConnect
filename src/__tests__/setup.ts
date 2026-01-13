jest.mock('../config/dataSource', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        })),
        createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
            getMany: jest.fn(),
        })),
        query: jest.fn(),
    },
}));
