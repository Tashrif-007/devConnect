import { AppDataSource } from '../config/dataSource';
import { User } from '../entity/userEntity';
import { CreateUserDTO, UpdateUserDTO } from '../dto/userDTO';
<<<<<<< HEAD
import { UpdateResult } from 'typeorm';
=======
>>>>>>> 0d7f2f6 (feat: integrate custom specific error classes)

export class UserRepository {
  private userRepository = AppDataSource.getRepository(User);

  async create(userData: CreateUserDTO): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { userId } });
  }
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async update(userId: string, userData: UpdateUserDTO): Promise<User | null> {
    await this.userRepository.update(userId, userData);
    return this.findById(userId);
  }
  async softDelete(userId: string): Promise<UpdateResult> {
    const result = await this.userRepository.softDelete(userId);
    return result;
  }
}
