import 'reflect-metadata';
import { AppDataSource } from '../config/dataSource';
import { CategoryService } from '../services/categoryService';
import * as fs from 'fs';
import * as path from 'path';

async function seedCategories() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const categoryService = new CategoryService();

        // Read categories from JSON file
        const categoriesFilePath = path.join(__dirname, 'categories.json');
        const categoriesData = JSON.parse(
            fs.readFileSync(categoriesFilePath, 'utf-8')
        );

        // Seed categories
        console.log(`🌱 Seeding ${categoriesData.length} categories...`);
        for (const categoryData of categoriesData) {
            await categoryService.createCategory(categoryData);
        }

        console.log(`✅ Successfully seeded ${categoriesData.length} categories`);
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
