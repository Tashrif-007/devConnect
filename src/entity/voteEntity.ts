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
import { VoteType } from '../enums/voteType';

@Entity({ name: 'Vote' })
@Index(['userId', 'storyId'], { unique: true })
export class Vote {
    @PrimaryGeneratedColumn('uuid')
    voteId: string;

    @Column()
    userId: string;

    @Column()
    storyId: string;

    @Column({
        type: 'enum',
        enum: VoteType,
        default: VoteType.UPVOTE,
    })
    voteType: VoteType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.votes)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Story, (story) => story.votes)
    @JoinColumn({ name: 'storyId' })
    story: Story;
}
