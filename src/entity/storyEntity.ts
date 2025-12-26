import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './userEntity';
import { Category } from './categoryEntity';
import { Vote } from './voteEntity';
import { Comment } from './commentEntity';

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

    @Column({ nullable: true })
    summary?: string;

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

    @OneToMany(() => Vote, (vote) => vote.story, { cascade: true })
    votes: Vote[];

    @OneToMany(() => Comment, (comment) => comment.story, { cascade: true })
    comments: Comment[];
}
