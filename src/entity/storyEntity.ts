import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './userEntity';

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

    @ManyToOne(() => User, (user) => user.stories)
    @JoinColumn({ name: 'userId' })
    user: User;
}
