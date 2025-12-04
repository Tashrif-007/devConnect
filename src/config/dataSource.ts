import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/userEntity';
import { Auth } from '../entity/authEntity';
import { Story } from '../entity/storyEntity';
import { envValues } from '../utils/envParser';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: envValues.DB_HOST,
    password: envValues.DB_PASSWORD,
    port: Number(envValues.DB_PORT),
    username: envValues.DB_USER,
    database: envValues.DB_DB,
    synchronize: true,
    entities: [User, Auth, Story],
    migrations: ['src/migrations/*.ts'],
});
