import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Auth } from './authEntity';
import { Story } from './storyEntity';
import { UserRole } from '../enums';

@Entity({ name: 'User' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @CreateDateColumn()
    joinDate: Date;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @OneToOne(() => Auth, (auth) => auth.user)
    auth: Auth;

    @OneToMany(() => Story, (story) => story.user)
    stories: Story[];
}
