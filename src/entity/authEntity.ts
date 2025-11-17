import {  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToOne,} from "typeorm";
import { User } from "./userEntity";

@Entity({ name: "Auth" })
@Unique(["username", "email"])
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string; 

  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({ name: "username", referencedColumnName: "username"})
  userByUsername: User;

  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "email", referencedColumnName: "email" })
  userByEmail: User;
}