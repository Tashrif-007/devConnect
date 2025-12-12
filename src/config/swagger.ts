/**
 * Swagger/OpenAPI Configuration
 * Centralized setup for API documentation using swagger-jsdoc and OpenAPI 3.0
 */

import { paths } from '../swagger/paths';
import { schemas } from '../swagger/schemas';

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'devConnect API',
            description:
                'Comprehensive API documentation for devConnect - A platform for sharing and discovering stories with AI-powered summaries.',
            version: '1.0.0',
            contact: {
                name: 'API Support',
                email: 'support@devconnect.com',
                url: 'https://github.com/Tashrif-007/devConnect',
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
            {
                url: 'https://api.devconnect.com',
                description: 'Production server',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description:
                    'User authentication and password management endpoints',
            },
            {
                name: 'Users',
                description: 'User profile and account management endpoints',
            },
            {
                name: 'Stories',
                description:
                    'Story creation, retrieval, and management endpoints',
            },
            {
                name: 'Categories',
                description: 'Story category management endpoints',
            },
            {
                name: 'Admin',
                description: 'Administrative endpoints for user management',
            },
            {
                name: 'Health',
                description: 'System health and status endpoints',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description:
                        'JWT Bearer token. Obtain this token by logging in or registering. Include it in the Authorization header as "Bearer {token}"',
                },
            },
            responses: {
                ValidationError: {
                    description:
                        'Validation error in request body or parameters',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ValidationErrorResponse',
                            },
                            examples: {
                                validationFailed: {
                                    value: {
                                        success: false,
                                        message: 'Validation failed',
                                        errors: [
                                            {
                                                field: 'email',
                                                message: 'Invalid email format',
                                            },
                                            {
                                                field: 'password',
                                                message:
                                                    'Password must be at least 8 characters',
                                            },
                                        ],
                                    },
                                },
                                invalidPassword: {
                                    value: {
                                        success: false,
                                        message: 'Invalid password',
                                    },
                                },
                                invalidCategoryId: {
                                    value: {
                                        success: false,
                                        message: 'Invalid category id provided',
                                    },
                                },
                            },
                        },
                    },
                },
                Unauthorized: {
                    description: 'Authentication required or invalid token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                unauthorized: {
                                    value: {
                                        success: false,
                                        message: 'Unauthorized access',
                                    },
                                },
                                headerMissing: {
                                    value: {
                                        success: false,
                                        message: 'Authorized header is missing',
                                    },
                                },
                                invalidHeader: {
                                    value: {
                                        success: false,
                                        message: 'Invalid auth header',
                                    },
                                },
                                tokenMissing: {
                                    value: {
                                        success: false,
                                        message: 'Auth token missing',
                                    },
                                },
                                invalidToken: {
                                    value: {
                                        success: false,
                                        message: 'Token invalid',
                                    },
                                },
                            },
                        },
                    },
                },
                Forbidden: {
                    description:
                        'Insufficient permissions or role to access the resource',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                accessForbidden: {
                                    value: {
                                        success: false,
                                        message: 'Access forbidden',
                                    },
                                },
                            },
                        },
                    },
                },
                Conflict: {
                    description:
                        'Resource conflict (duplicate, already exists, etc.)',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                conflict: {
                                    value: {
                                        success: false,
                                        message: 'Resource Conflict',
                                    },
                                },
                                usernameExists: {
                                    value: {
                                        success: false,
                                        message: 'Username already exists',
                                    },
                                },
                                emailExists: {
                                    value: {
                                        success: false,
                                        message: 'Email already exists',
                                    },
                                },
                                emailAlreadyConfirmed: {
                                    value: {
                                        success: false,
                                        message: 'Email is already confirmed',
                                    },
                                },
                                codeAlreadyUsed: {
                                    value: {
                                        success: false,
                                        message: 'Code Already Used',
                                    },
                                },
                            },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                notFound: {
                                    value: {
                                        success: false,
                                        message: 'Resource not found',
                                    },
                                },
                                userNotFound: {
                                    value: {
                                        success: false,
                                        message: 'User not found',
                                    },
                                },
                                storyNotFound: {
                                    value: {
                                        success: false,
                                        message: 'Story not found',
                                    },
                                },
                                categoryNotFound: {
                                    value: {
                                        success: false,
                                        message: 'Category not found',
                                    },
                                },
                            },
                        },
                    },
                },
                TooManyRequests: {
                    description:
                        'Rate limit exceeded. Too many requests in a short time.',
                    headers: {
                        'x-rate-limit-limit': {
                            schema: { type: 'integer' },
                            description: 'Request limit per window',
                        },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                            description: 'Remaining requests in current window',
                        },
                        'x-rate-limit-reset': {
                            schema: { type: 'integer' },
                            description:
                                'Unix timestamp when rate limit resets',
                        },
                        'Retry-After': {
                            schema: { type: 'integer' },
                            description:
                                'Seconds until the next request can be made',
                        },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                tooManyRequests: {
                                    value: {
                                        success: false,
                                        message: 'Too many requests sent',
                                    },
                                },
                            },
                        },
                    },
                },
                InternalServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                serverError: {
                                    value: {
                                        success: false,
                                        message: 'Internal Server Error',
                                    },
                                },
                                databaseError: {
                                    value: {
                                        success: false,
                                        message: 'Database operation failed',
                                    },
                                },
                                badGateway: {
                                    value: {
                                        success: false,
                                        message:
                                            'Request Failed. Please try later.',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            schemas,
        },
        paths,
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: [],
};

/**
 * Swagger UI customization options
 */
export const swaggerUIOptions = {
    // Customize appearance
    customCss: `
    .swagger-ui .topbar {
      background-color: #1e3a8a;
    }
    .swagger-ui .logo__img {
      max-width: 100%;
    }
  `,
    customSiteTitle: 'devConnect API Documentation',
    swaggerOptions: {
        // Show operation filtering
        filter: true,
        // Display only 2 levels deep in the model tree
        defaultModelsExpandDepth: 2,
        // Default expansion level for models in responses
        defaultModelExpandDepth: 2,
        // Show operation request bodies by default
        docExpansion: 'list',
        // Display request headers
        showRequestHeaders: true,
        // Enable persistent auth
        persistAuthorization: true,
        // Show operation filtering
        supportedSubmitMethods: [
            'get',
            'post',
            'put',
            'delete',
            'patch',
            'head',
            'options',
            'trace',
        ],
    },
};
