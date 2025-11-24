import { AppDataSource } from '../config/dataSource';
import { User } from '../entity/userEntity';
import { CreateUserDTO, UpdateUserDTO } from '../dto/userDTO';

export class UserRepository {
  private userRepository = AppDataSource.getRepository(User);

  async create(userData: CreateUserDTO) {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findAll() {
    return this.userRepository.find();
  }
  async findById(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }
  async findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  async update(userId: string, userData: UpdateUserDTO) {
    await this.userRepository.update(userId, userData);
    return this.findById(userId);
  }
  async softDelete(userId: string) {
    const result = await this.userRepository.softDelete(userId);
    return result;
  }
}