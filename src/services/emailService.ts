import { injectable } from 'tsyringe';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfirmationDTO } from '../dto/authDTO';
import { envValues } from '../utils/envParser';
import ejs from 'ejs';

@injectable()
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
        const html = await ejs.renderFile(userData.templatePath, {
            username: userData.username,
            token: userData.token,
            email: userData.email,
            confirmationUrl: userData.confirmationUrl
        });
        const mailOptions = {
            from: envValues.SMTP_FROM_EMAIL,
            to: userData.email,
            subject: userData.subject,
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
