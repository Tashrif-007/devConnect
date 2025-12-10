import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './userEntity';
import { Category } from './categoryEntity';

@Entity({ name: 'Story' })
export class Story {
    @PrimaryGeneratedColumn('uuid')
    storyId: string;

    @Column()
    title: string;

    @Column()
    body: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.stories)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToMany(() => Category, (category) => category.stories)
    @JoinTable()
    categories: Category[];
}
