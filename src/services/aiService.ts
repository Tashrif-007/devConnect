import { OpenRouterError } from '../errors/errors';
import { envValues } from '../utils/envParser';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

@injectable()
export class AiService {
    async summarize(prompt: string) {
        const response = await fetch(envValues.OPENROUTER_ENDPOINT!, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${envValues.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'devConnect',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: `You are a technical content summarizer. Summarize the following tech support post in 2-3 sentences maximum. Be concise and capture the main issue/question only. Do not provide solutions. Here it is: ${prompt}`,
                    },
                ],
                max_tokens: 150,
            }),
        });
        const json = await response.json();
        if (!response.ok) {
            throw new OpenRouterError(json.error?.message, json.error?.code);
        }
        return json.choices?.[0]?.message?.content ?? '';
    }
}
