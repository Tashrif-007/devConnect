import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfirmationDTO } from '../dto/authDTO';
import { envValues } from '../utils/envParser';
import path from 'path';
import ejs from 'ejs';
import { signEmailConfirmationToken } from '../utils/jwtUtil';

export class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: envValues.SMTP_HOST,
            port: Number(envValues.SMTP_PORT),
            secure: envValues.SMTP_SECURE === 'true',
            auth: {
                user: envValues.SMTP_USER,
                pass: envValues.SMTP_PASSWORD,
            },
        });
    }

    async sendConfirmationEmail(userData: EmailConfirmationDTO): Promise<void> {
        const token = signEmailConfirmationToken(userData.userId);

        const confirmationUrl = `${envValues.APP_URL || 'http://localhost:3000'}/auth/confirm-email/${token}`;
        const templatePath = path.join(
            __dirname,
            '../templates/emailConfirmation.ejs',
        );
        const html = await ejs.renderFile(templatePath, {
            username: userData.username,
            confirmationUrl,
            token,
        });
        const mailOptions = {
            from: envValues.SMTP_FROM_EMAIL,
            to: userData.email,
            subject: 'Confirm Your Email - devConnect',
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendGenericEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL || 'noreply@devconnect.com',
            to,
            subject,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
