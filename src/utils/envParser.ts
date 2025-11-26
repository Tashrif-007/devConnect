import dotenv from 'dotenv';

dotenv.config();

export const envValues = {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DB: process.env.DB_DB,
    VERSION: process.env.VERSION,
    NODE_ENV: process.env.NODE_ENV
}