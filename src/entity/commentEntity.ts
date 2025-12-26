import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './userEntity';
import { Story } from './storyEntity';

@Entity({ name: 'Comment' })
@Index(['storyId'])
@Index(['userId'])
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    commentId: string;

    @Column({ type: 'text' })
    body: string;

    @Column()
    userId: string;

    @Column()
    storyId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.comments)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Story, (story) => story.comments)
    @JoinColumn({ name: 'storyId' })
    story: Story;
}
