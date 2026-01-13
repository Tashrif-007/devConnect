import 'reflect-metadata';
import { EmailService } from '../services/emailService';
import { EmailConfirmationDTO } from '../dto/authDTO';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';

jest.mock('ejs');
jest.mock('nodemailer');

describe('EmailService', () => {
    let emailService: EmailService;
    let mockTransporter: any;

    beforeEach(() => {
        mockTransporter = {
            sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' }),
        };

        (nodemailer.createTransport as jest.Mock).mockReturnValue(
            mockTransporter,
        );

        emailService = new EmailService();

        jest.clearAllMocks();
    });

    describe('sendConfirmationEmail', () => {
        it('should send confirmation email successfully', async () => {
            const userData: EmailConfirmationDTO = {
                userId: 'user-123',
                username: 'johndoe',
                email: 'john@example.com',
                subject: 'Confirm Your Email - devConnect',
                templatePath: '/path/to/template.ejs',
                token: 'email-token-123',
                confirmationUrl: 'http://localhost:3000/confirm-email/token',
            };

            (ejs.renderFile as jest.Mock).mockResolvedValue(
                '<html>Confirmation email</html>',
            );

            await emailService.sendConfirmationEmail(userData);

            expect(ejs.renderFile).toHaveBeenCalledWith(
                userData.templatePath,
                expect.objectContaining({
                    username: userData.username,
                    token: userData.token,
                    email: userData.email,
                    confirmationUrl: userData.confirmationUrl,
                }),
            );
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: userData.email,
                    subject: userData.subject,
                    html: '<html>Confirmation email</html>',
                }),
            );
        });

        it('should handle email rendering error', async () => {
            const userData: EmailConfirmationDTO = {
                userId: 'user-123',
                username: 'johndoe',
                email: 'john@example.com',
                subject: 'Confirm Your Email',
                templatePath: '/invalid/path.ejs',
                token: 'email-token-123',
            };

            (ejs.renderFile as jest.Mock).mockRejectedValue(
                new Error('Template not found'),
            );

            await expect(
                emailService.sendConfirmationEmail(userData),
            ).rejects.toThrow('Template not found');
            expect(mockTransporter.sendMail).not.toHaveBeenCalled();
        });

        it('should handle email sending error', async () => {
            const userData: EmailConfirmationDTO = {
                userId: 'user-123',
                username: 'johndoe',
                email: 'john@example.com',
                subject: 'Confirm Your Email',
                templatePath: '/path/to/template.ejs',
                token: 'email-token-123',
            };

            (ejs.renderFile as jest.Mock).mockResolvedValue(
                '<html>Email</html>',
            );
            mockTransporter.sendMail.mockRejectedValue(
                new Error('SMTP connection failed'),
            );

            await expect(
                emailService.sendConfirmationEmail(userData),
            ).rejects.toThrow('SMTP connection failed');
        });
    });

    describe('sendGenericEmail', () => {
        it('should send generic email successfully', async () => {
            const to = 'user@example.com';
            const subject = 'Test Email';
            const html = '<html>Test content</html>';

            await emailService.sendGenericEmail(to, subject, html);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to,
                    subject,
                    html,
                }),
            );
        });

        it('should include from address in generic email', async () => {
            const to = 'user@example.com';
            const subject = 'Test Email';
            const html = '<html>Test content</html>';

            await emailService.sendGenericEmail(to, subject, html);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: expect.any(String),
                    to,
                    subject,
                    html,
                }),
            );
        });

        it('should handle error when sending generic email', async () => {
            const to = 'user@example.com';
            const subject = 'Test Email';
            const html = '<html>Test content</html>';

            mockTransporter.sendMail.mockRejectedValue(
                new Error('Email service unavailable'),
            );

            await expect(
                emailService.sendGenericEmail(to, subject, html),
            ).rejects.toThrow('Email service unavailable');
        });

        it('should use fallback from email when env var is not set', async () => {
            const to = 'user@example.com';
            const subject = 'Test Email';
            const html = '<html>Test content</html>';

            const originalEnv = process.env.SMTP_FROM_EMAIL;

            delete process.env.SMTP_FROM_EMAIL;

            const newEmailService = new EmailService();

            await newEmailService.sendGenericEmail(to, subject, html);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'noreply@devconnect.com',
                    to,
                    subject,
                    html,
                }),
            );

            if (originalEnv) {
                process.env.SMTP_FROM_EMAIL = originalEnv;
            }
        });
    });
});
