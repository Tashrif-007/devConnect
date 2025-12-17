import 'reflect-metadata';
import { AiService } from '../services/aiService';
import { OpenRouterError } from '../errors/errors';
import * as envParserModule from '../utils/envParser';

jest.mock('../utils/envParser');
jest.mock('../config/dataSource');
global.fetch = jest.fn();

describe('AiService', () => {
    let aiService: AiService;

    beforeEach(() => {
        jest.mocked(envParserModule.envValues as any).OPENROUTER_ENDPOINT =
            'https://openrouter.ai/api/v1/chat/completions';
        jest.mocked(envParserModule.envValues as any).OPENROUTER_API_KEY =
            'test-api-key';

        aiService = new AiService();
        jest.clearAllMocks();
    });

    afterEach(() => {
        (global.fetch as jest.Mock).mockReset();
    });

    describe('summarize', () => {
        it('should summarize prompt successfully', async () => {
            const prompt =
                'This is a long technical post that needs summarization';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: 'This is a concise summary',
                            },
                        },
                    ],
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await aiService.summarize(prompt);

            expect(global.fetch).toHaveBeenCalled();
            expect(result).toBe('This is a concise summary');
        });

        it('should handle API response with empty content', async () => {
            const prompt = 'Test prompt';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {
                                content: '',
                            },
                        },
                    ],
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await aiService.summarize(prompt);

            expect(result).toBe('');
        });

        it('should handle API response with missing content', async () => {
            const prompt = 'Test prompt';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [
                        {
                            message: {},
                        },
                    ],
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const result = await aiService.summarize(prompt);

            expect(result).toBe('');
        });

        it('should throw OpenRouterError on API error', async () => {
            const prompt = 'Test prompt';
            const errorMessage = 'Invalid API key';
            const errorCode = 401;

            const mockResponse = {
                ok: false,
                json: jest.fn().mockResolvedValue({
                    error: {
                        message: errorMessage,
                        code: errorCode,
                    },
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            await expect(aiService.summarize(prompt)).rejects.toThrow(
                OpenRouterError,
            );
        });

        it('should throw error on network failure', async () => {
            const prompt = 'Test prompt';

            (global.fetch as jest.Mock).mockRejectedValue(
                new Error('Network timeout'),
            );

            await expect(aiService.summarize(prompt)).rejects.toThrow(
                'Network timeout',
            );
        });

        it('should include correct headers in API request', async () => {
            const prompt = 'Test prompt';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Summary' } }],
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            await aiService.summarize(prompt);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'devConnect',
                    }),
                }),
            );
        });

        it('should include prompt in request body', async () => {
            const prompt = 'Test technical content';
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Summary' } }],
                }),
            };

            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            await aiService.summarize(prompt);

            const callArgs = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            expect(body.messages[0].content).toContain(prompt);
        });
    });
});
