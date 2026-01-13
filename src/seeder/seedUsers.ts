import 'reflect-metadata';
import { AppDataSource } from '../config/dataSource';
import { UserService } from '../services/userService';
import * as fs from 'fs';
import * as path from 'path';
import { container } from 'tsyringe';

async function seedUsers() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const userService = container.resolve(UserService);

        const usersFilePath = path.join(__dirname, 'users.json');
        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

        console.log(`🌱 Seeding ${usersData.length} users...`);

        for (let i = 0; i < usersData.length; i++) {
            const userData = usersData[i];

            const createUserDTO = {
                username: userData.username,
                name: userData.name,
                email: userData.email,
                role: userData.role || 'USER',
            };

            try {
                await userService.createUser(createUserDTO);
                console.log(
                    `   ✓ User ${i + 1}/${usersData.length} (${userData.username}) created`,
                );
            } catch (error: any) {
                if (
                    error.message?.includes('USERNAME_EXISTS') ||
                    error.message?.includes('EMAIL_EXISTS')
                ) {
                    console.log(
                        `   ⊘ User ${i + 1}/${usersData.length} (${userData.username}) already exists`,
                    );
                } else {
                    throw error;
                }
            }
        }

        console.log(`✅ Successfully seeded users`);
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
