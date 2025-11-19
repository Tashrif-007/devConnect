import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, DeleteDateColumn, Unique } from 'typeorm';
import { Auth } from './authEntity';

export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

@Entity({ name: "User" })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column({ unique: true} )
  email: string;

  @CreateDateColumn()
  joinDate: Date;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;
}