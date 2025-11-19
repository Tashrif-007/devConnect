import {  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToOne,} from "typeorm";
import { User } from "./userEntity";

@Entity({ name: "Auth" })
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  username: string;

  @Column({unique: true})
  email: string;

  @Column()
  password: string; 

  @OneToOne(() => User, user => user.auth)
  @JoinColumn([
    { name: "username", referencedColumnName: "username"},
    { name: "email", referencedColumnName: "email"},
  ])
  user: User;
}