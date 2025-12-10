import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Story } from './storyEntity';

@Entity({ name: 'Category' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    categoryId: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToMany(() => Story, (story) => story.categories)
    stories: Story[];
}
