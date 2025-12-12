import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './userEntity';

@Entity({ name: 'Auth' })
export class Auth {
    @PrimaryGeneratedColumn('uuid')
    authId: string;

    @Column()
    userId: string;

    @Column()
    password: string;

    @Column({ nullable: true, default: null })
    confirmationCode?: string;

    @Column({ type: 'timestamp', nullable: true })
    codeExpiresAt: Date | null;

    @Column({ default: false })
    isUsed: boolean;

    @Column({ type: 'timestamp', nullable: true })
    passwordLastModificationTime: Date | null;

    @OneToOne(() => User, (user) => user.auth)
    @JoinColumn({ name: 'userId' })
    user: User;
}