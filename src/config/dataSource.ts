import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/userEntity';
import { Auth } from '../entity/authEntity';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  database: process.env.DB_DB,
  synchronize: true,
  entities: [User, Auth],
});
