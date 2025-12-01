import { AuthRepository } from '../repositories/authRepository';
import { SignupDTO, AuthResponseDTO, LoginDTO } from '../dto/authDTO';
import { envValues } from '../utils/envParser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from './userService';
import { ConflictError, UnauthorizedError } from '../errors/errors';
import { AUTH_RESPONSE_MESSAGES } from '../constants/messages';

export class AuthService {
    private authRepository: AuthRepository;
    private userService: UserService;
    private jwtSecret: string;
    private jwtExpiry: string;

    constructor() {
        this.authRepository = new AuthRepository();
        this.userService = new UserService();
        this.jwtSecret = envValues.JWT_SECRET!;
        this.jwtExpiry = envValues.JWT_EXPIRY!;
    }

    async signup(signupData: SignupDTO) {
        if (signupData.password !== signupData.confirmPassword) {
            throw new ConflictError(
                AUTH_RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED,
            );
        }
        const hashedPassword = await bcrypt.hash(signupData.password, 10);

        const user = await this.userService.createUser({
            username: signupData.username,
            name: signupData.name,
            email: signupData.email,
        });

        await this.authRepository.create({
            userId: user.userId,
            hashedPassword,
        });

        return AuthResponseDTO.fromEntity(user);
    }

    async login(loginData: LoginDTO) {
        const user = await this.userService.getUserByEmail(loginData.email);

        const auth = await this.authRepository.findByUserId(user!.userId);

        const isValidPassword = await bcrypt.compare(
            loginData.password,
            auth!.password,
        );
        if (!isValidPassword) {
            throw new UnauthorizedError('wrong pass');
        }
        const token = jwt.sign(
            {
                userId: user?.userId,
                email: user?.email,
                username: user?.username,
                role: user?.role,
            },
            this.jwtSecret,
            { expiresIn: '30d' },
        );

        return {
            token,
            user: AuthResponseDTO.fromEntity(user!),
        };
    }
}
