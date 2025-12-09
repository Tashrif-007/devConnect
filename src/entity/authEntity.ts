import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./userEntity";

@Entity({ name: "Auth" })
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  authId: string;

  @Column()
  userId: string;

  @Column()
  password: string;

  @Column({ type: "timestamp", nullable: true })
  passwordLastModificationTime: Date | null;

  @OneToOne(() => User, user => user.auth)
  @JoinColumn({ name: "userId" })
  user: User;
}