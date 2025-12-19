import { injectable } from 'tsyringe';
import { AuthRepository } from '../repositories/authRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import {
    SignupDTO,
    AuthResponseDTO,
    LoginDTO,
    jwtPayload,
    EmailConfirmationDTO,
    LoginResponseDTO,
} from '../dto/authDTO';
import bcrypt from 'bcrypt';
import { UserService } from './userService';
import {
    ConflictError,
    UnauthorizedError,
    NotFoundError,
    ValidationError,
} from '../errors/errors';
import { AUTH_RESPONSE_MESSAGES, ERROR_MESSAGES } from '../constants/messages';
import {
    signEmailConfirmationToken,
    signToken,
    verifyEmailConfirmationToken,
    verifyToken,
} from '../utils/jwtUtil';
import { EmailService } from './emailService';
import path from 'path';
import { envValues } from '../utils/envParser';
import crypto from 'crypto';

@injectable()
export class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private transactionRepository: TransactionRepository,
        private userService: UserService,
        private emailService: EmailService,
    ) {}

    private async sendEmail(userDTO: EmailConfirmationDTO) {
        await this.emailService.sendConfirmationEmail({
            userId: userDTO.userId,
            username: userDTO.username,
            email: userDTO.email,
            subject: userDTO.subject,
            templatePath: userDTO.templatePath,
            token: userDTO.token,
            confirmationUrl: userDTO.confirmationUrl,
        });
    }

    async signup(signupData: SignupDTO) {
        if (signupData.password !== signupData.confirmPassword) {
            throw new ConflictError(
                AUTH_RESPONSE_MESSAGES.PASSWORD_NOT_MATCHED,
            );
        }
        const hashedPassword = await bcrypt.hash(signupData.password, 10);

        const userDTO = await this.transactionRepository.executeInTransaction(
            async () => {
                const createdUserDTO = await this.userService.createUser({
                    username: signupData.username,
                    name: signupData.name,
                    email: signupData.email,
                });

                await this.authRepository.create({
                    userId: createdUserDTO.userId,
                    hashedPassword,
                });

                return createdUserDTO;
            },
        );
        const token = signEmailConfirmationToken(userDTO.userId);
        await this.sendEmail({
            userId: userDTO.userId,
            username: userDTO.username,
            email: userDTO.email,
            subject: 'Confirm Your Email - devConnect',
            templatePath: path.join(
                __dirname,
                '../templates/emailConfirmation.ejs',
            ),
            token,
            confirmationUrl: `${envValues.APP_URL || 'http://localhost:3000'}/auth/confirm-email/${token}`,
        });

        return userDTO;
    }

    async login(loginData: LoginDTO): Promise<LoginResponseDTO> {
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
            throw new ConflictError(ERROR_MESSAGES.EMAIL_CONFIRMED_ALREADY);
        }
        const token = signEmailConfirmationToken(user.userId);

        await this.emailService.sendConfirmationEmail({
            userId: user.userId,
            username: user.username,
            email: user.email,
            subject: 'Confirm Your Email - devConnect',
            templatePath: path.join(
                __dirname,
                '../templates/emailConfirmation.ejs',
            ),
            token,
            confirmationUrl: `${envValues.APP_URL || 'http://localhost:3000'}/auth/confirm-email/${token}`,
        });

        return {
            message: AUTH_RESPONSE_MESSAGES.CONFIRMATION_EMAIL_RESENT,
        };
    }
    async changePassword(userId: string, password: string) {
        const auth = await this.authRepository.findByUserId(userId);
        if (auth === null) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const isValidPassword = await bcrypt.compare(password, auth.password);
        if (!isValidPassword) {
            throw new ValidationError(ERROR_MESSAGES.VALIDATION_FAILED);
        }
        const confirmationCode = crypto.randomInt(100000, 1000000);
        await this.authRepository.update({
            userId,
            confirmationCode: String(confirmationCode),
            codeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            isUsed: false,
        });

        await this.emailService.sendConfirmationEmail({
            userId: auth.userId,
            username: auth.user.username,
            email: auth.user.email,
            subject: 'Change Password - devConnect',
            templatePath: path.join(
                __dirname,
                '../templates/passwordChanged.ejs',
            ),
            token: confirmationCode,
        });
    }

    async validateCode(userId: string, confirmationCode: string) {
        const auth = await this.authRepository.findByUserId(userId);
        if (!auth) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        if (auth.confirmationCode !== confirmationCode) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_CODE);
        }

        if (auth.codeExpiresAt && new Date() > auth.codeExpiresAt) {
            throw new ValidationError(ERROR_MESSAGES.EXPIRED);
        }

        if (auth.isUsed) {
            throw new ValidationError(ERROR_MESSAGES.USED);
        }

        const sessionToken = signToken(
            {
                userId,
                email: auth.user.email,
                username: auth.user.username,
                role: auth.user.role,
                type: 'password-reset',
            },
            300,
        );

        return {
            message: AUTH_RESPONSE_MESSAGES.CODE_VALIDATED,
            sessionToken,
        };
    }

    async updatePassword(
        userId: string,
        newPassword: string,
        sessionToken: string,
    ) {
        const auth = await this.authRepository.findByUserId(userId);
        if (!auth) {
            throw new NotFoundError(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        try {
            const decoded = verifyToken(sessionToken);
            if (decoded.type !== 'password-reset') {
                throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
            }
        } catch (error) {
            throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
        }

        if (auth.isUsed) {
            throw new UnauthorizedError(ERROR_MESSAGES.USED);
        }

        if (!auth.codeExpiresAt || new Date() > auth.codeExpiresAt) {
            throw new UnauthorizedError(ERROR_MESSAGES.EXPIRED);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.authRepository.update({
            userId,
            password: hashedPassword,
            isUsed: true,
            passwordLastModificationTime: new Date(Date.now()),
        });

        return {
            message: 'Password updated successfully',
        };
    }
    async verifyUserAuthExists(userId: string) {
        const auth = await this.authRepository.findByUserId(userId);
        return auth !== null;
    }
}
