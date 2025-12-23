import 'reflect-metadata';
import { AppDataSource } from '../config/dataSource';
import { StoryService } from '../services/storyService';
import { UserRepository } from '../repositories/userRepository';
import * as fs from 'fs';
import * as path from 'path';
import { container } from 'tsyringe';

async function seedStories() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const storyService = container.resolve(StoryService);
        const userRepository = container.resolve(UserRepository);

        // Get all users
        const users = await userRepository.findAll(1, 100);

        if (users.data.length === 0) {
            console.log('❌ No users found. Please seed users first.');
            await AppDataSource.destroy();
            return;
        }

        const storiesFilePath = path.join(__dirname, 'stories.json');
        const storiesData = JSON.parse(
            fs.readFileSync(storiesFilePath, 'utf-8'),
        );

        console.log(`🌱 Seeding ${storiesData.length} stories...`);

        for (let i = 0; i < storiesData.length; i++) {
            const storyData = storiesData[i];
            const user = users.data[i % users.data.length]; // Distribute stories among users

            const createStoryDTO = {
                title: storyData.title,
                body: storyData.body,
                userId: user.userId,
                categoryIds: storyData.categoryIds || undefined,
                summary: storyData.summary || undefined,
                skip: false,
            };

            await storyService.createStory(createStoryDTO);
            console.log(`   ✓ Story ${i + 1}/${storiesData.length} created`);
        }

        console.log(`✅ Successfully seeded ${storiesData.length} stories`);
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error seeding stories:', error);
        process.exit(1);
    }
}

seedStories();
