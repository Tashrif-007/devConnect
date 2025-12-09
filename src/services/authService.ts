import { AuthRepository } from '../repositories/authRepository';
import {
    SignupDTO,
    AuthResponseDTO,
    LoginDTO,
    jwtPayload,
    EmailConfirmationDTO,
} from '../dto/authDTO';
import bcrypt from 'bcrypt';
import { UserService } from './userService';
import {
    ConflictError,
    UnauthorizedError,
    NotFoundError,
} from '../errors/errors';
import { AUTH_RESPONSE_MESSAGES, ERROR_MESSAGES } from '../constants/messages';
import { AppDataSource } from '../config/dataSource';
import { signToken, verifyEmailConfirmationToken } from '../utils/jwtUtil';
import { EmailService } from './emailService';

export class AuthService {
    private authRepository: AuthRepository;
    private userService: UserService;
    private emailService: EmailService;

    constructor() {
        this.authRepository = new AuthRepository();
        this.userService = new UserService();
        this.emailService = new EmailService();
    }

    private async sendEmail(userDTO: EmailConfirmationDTO) {
        await this.emailService.sendConfirmationEmail({
            userId: userDTO.userId,
            username: userDTO.username,
            email: userDTO.email,
        });
    }

    async signup(signupData: SignupDTO) {
        return await AppDataSource.transaction(async (entityManager) => {
            if (signupData.password !== signupData.confirmPassword) {
                throw new ConflictError(
                    AUTH_RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED,
                );
            }
            const hashedPassword = await bcrypt.hash(signupData.password, 10);

            const userDTO = await this.userService.createUser(
                {
                    username: signupData.username,
                    name: signupData.name,
                    email: signupData.email,
                },
                entityManager,
            );

            await this.authRepository.create({
                userId: userDTO.userId,
                hashedPassword,
            });

            await this.sendEmail(userDTO);

            return userDTO;
        });
    }

    async login(loginData: LoginDTO) {
        const user = await this.userService.getUserByEmail(loginData.email);

        if (!user?.isEmailConfirmed) {
            throw new UnauthorizedError(
                AUTH_RESPONSE_MESSAGES.EMAIL_NOT_CONFIRMED,
            );
        }

        const auth = await this.authRepository.findByUserId(user!.userId);

        const isValidPassword = await bcrypt.compare(
            loginData.password,
            auth!.password,
        );
        if (!isValidPassword) {
            throw new UnauthorizedError(ERROR_MESSAGES.VALIDATION_FAILED);
        }

        const jwtPayload: jwtPayload = {
            userId: user!.userId,
            email: user!.email,
            username: user!.username,
            role: user!.role,
        };
        const token = signToken(jwtPayload);

        return {
            token,
            user: AuthResponseDTO.fromEntity(user!),
        };
    }

    async confirmEmail(token: string) {
        const userId = verifyEmailConfirmationToken(token);

        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        await this.userService.updateUser(user.userId, {
            isEmailConfirmed: true,
        });

        return AuthResponseDTO.fromEntity(user);
    }

    async resendConfirmationEmail(email: string) {
        const user = await this.userService.getUserByEmail(email);

        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        if (user.isEmailConfirmed) {
            throw new ConflictError('Email is already confirmed');
        }

        await this.emailService.sendConfirmationEmail(user);

        return {
            message: AUTH_RESPONSE_MESSAGES.CONFIRMATION_EMAIL_RESENT,
        };
    }
}
