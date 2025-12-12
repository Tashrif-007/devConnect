/**
 * OpenAPI 3.0 Schema Definitions
 * Mirrors Zod DTOs and defines reusable schemas for Swagger documentation
 */

export const schemas = {
    // Auth Schemas
    SignupRequest: {
        type: 'object',
        required: ['username', 'name', 'email', 'password', 'confirmPassword'],
        properties: {
            username: {
                type: 'string',
                minLength: 3,
                maxLength: 50,
                description: 'Unique username',
                example: 'john_doe',
            },
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Full name of the user',
                example: 'John Doe',
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'User email address',
                example: 'john@example.com',
            },
            password: {
                type: 'string',
                minLength: 8,
                pattern:
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
                description:
                    'Password (min 8 chars: uppercase, lowercase, number, special char)',
                example: 'SecurePass123!',
            },
            confirmPassword: {
                type: 'string',
                description: 'Password confirmation (must match password)',
                example: 'SecurePass123!',
            },
        },
    },

    LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
            password: {
                type: 'string',
                example: 'SecurePass123!',
            },
        },
    },

    ResendConfirmationEmailRequest: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
        },
    },

    ValidateCodeRequest: {
        type: 'object',
        required: ['confirmationCode'],
        properties: {
            confirmationCode: {
                type: 'string',
                description: 'Email confirmation code',
                example: '123456',
            },
        },
    },

    ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword'],
        properties: {
            currentPassword: {
                type: 'string',
                description: 'Current password for verification',
                example: 'CurrentPass123!',
            },
        },
    },

    UpdatePasswordWithTokenRequest: {
        type: 'object',
        required: ['newPassword', 'sessionToken'],
        properties: {
            newPassword: {
                type: 'string',
                minLength: 8,
                pattern:
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
                description:
                    'New password (same complexity requirements as signup)',
                example: 'NewSecurePass456!',
            },
            sessionToken: {
                type: 'string',
                description: 'Session token from password change initiation',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    },

    AuthResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            message: {
                type: 'string',
                example: 'User registered successfully',
            },
            data: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string',
                        description: 'JWT authentication token',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    user: {
                        $ref: '#/components/schemas/UserResponse',
                    },
                },
            },
        },
    },

    // User Schemas
    UpdateProfileRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                example: 'John Updated Doe',
            },
            profilePictureUrl: {
                type: 'string',
                format: 'uri',
                nullable: true,
                example: 'https://example.com/profile.jpg',
            },
        },
    },

    UpdateUserRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                example: 'Jane Doe',
            },
            isEmailConfirmed: {
                type: 'boolean',
                example: true,
            },
        },
    },

    UserResponse: {
        type: 'object',
        required: [
            'userId',
            'username',
            'name',
            'email',
            'joinDate',
            'isEmailConfirmed',
            'role',
        ],
        properties: {
            userId: {
                type: 'string',
                format: 'uuid',
                example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
            },
            username: {
                type: 'string',
                example: 'john_doe',
            },
            name: {
                type: 'string',
                example: 'John Doe',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john@example.com',
            },
            joinDate: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-12T10:30:00Z',
            },
            isEmailConfirmed: {
                type: 'boolean',
                example: true,
            },
            role: {
                type: 'string',
                enum: ['ADMIN', 'USER'],
                example: 'USER',
            },
            profilePictureUrl: {
                type: 'string',
                format: 'uri',
                nullable: true,
                example: 'https://example.com/profile.jpg',
            },
        },
    },

    PaginationQuery: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                minimum: 1,
                default: 1,
                description: 'Page number',
            },
            itemsPerPage: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Items per page',
            },
            find: {
                type: 'string',
                description: 'Search term',
            },
            sortBy: {
                type: 'string',
                enum: ['ASC', 'DESC'],
                default: 'DESC',
                description: 'Sort direction',
            },
            orderBy: {
                type: 'string',
                enum: ['USER_ID', 'USERNAME', 'NAME', 'EMAIL', 'JOIN_DATE'],
                default: 'USER_ID',
                description: 'Field to sort by',
            },
        },
    },

    PaginationMeta: {
        type: 'object',
        required: [
            'currentPage',
            'itemsPerPage',
            'totalItems',
            'totalPages',
            'hasNextPage',
            'hasPreviousPage',
        ],
        properties: {
            currentPage: {
                type: 'integer',
                example: 1,
            },
            itemsPerPage: {
                type: 'integer',
                example: 10,
            },
            totalItems: {
                type: 'integer',
                example: 42,
            },
            totalPages: {
                type: 'integer',
                example: 5,
            },
            hasNextPage: {
                type: 'boolean',
                example: true,
            },
            hasPreviousPage: {
                type: 'boolean',
                example: false,
            },
        },
    },

    PaginatedUserResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'pagination'],
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            message: {
                type: 'string',
                example: 'Users fetched successfully',
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/UserResponse',
                },
            },
            pagination: {
                $ref: '#/components/schemas/PaginationMeta',
            },
        },
    },

    // Story Schemas
    CreateStoryRequest: {
        type: 'object',
        required: ['title', 'body', 'skip'],
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Story title',
                example: 'My First Story',
            },
            body: {
                type: 'string',
                minLength: 1,
                maxLength: 5000,
                description: 'Story content',
                example: 'This is the story content...',
            },
            categoryIds: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uuid',
                },
                description: 'Array of category UUIDs',
                example: ['d1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d'],
            },
            skip: {
                type: 'boolean',
                description: 'Whether to skip AI summary generation',
                example: false,
            },
        },
    },

    UpdateStoryRequest: {
        type: 'object',
        properties: {
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                example: 'Updated Story Title',
            },
            body: {
                type: 'string',
                minLength: 1,
                maxLength: 5000,
                example: 'Updated story content...',
            },
            categoryIds: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uuid',
                },
                example: ['d1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d'],
            },
            skip: {
                type: 'boolean',
                example: false,
            },
        },
    },

    StoryResponse: {
        type: 'object',
        required: [
            'storyId',
            'title',
            'body',
            'userId',
            'createdAt',
            'updatedAt',
        ],
        properties: {
            storyId: {
                type: 'string',
                format: 'uuid',
                example: 's1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
            },
            title: {
                type: 'string',
                example: 'My First Story',
            },
            body: {
                type: 'string',
                example: 'This is the story content...',
            },
            userId: {
                type: 'string',
                format: 'uuid',
                example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
            },
            summary: {
                type: 'string',
                nullable: true,
                description: 'AI-generated summary',
                example: 'Generated summary of the story content...',
            },
            categoryNames: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Array of category names',
                example: ['Adventure', 'Fiction'],
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-12T10:30:00Z',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-12T10:30:00Z',
            },
        },
    },

    StoryQueryParams: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                minimum: 1,
                default: 1,
            },
            itemsPerPage: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
            },
            find: {
                type: 'string',
                description: 'Search term',
            },
            category: {
                type: 'string',
                description: 'Filter by category name',
            },
            sortBy: {
                type: 'string',
                enum: ['ASC', 'DESC'],
                default: 'DESC',
            },
            orderBy: {
                type: 'string',
                enum: ['STORY_ID', 'TITLE', 'CREATED_AT', 'UPDATED_AT'],
                default: 'STORY_ID',
            },
        },
    },

    PaginatedStoryResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'pagination'],
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            message: {
                type: 'string',
                example: 'Stories fetched successfully',
            },
            data: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/StoryResponse',
                },
            },
            pagination: {
                $ref: '#/components/schemas/PaginationMeta',
            },
        },
    },

    // Category Schemas
    CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
            name: {
                type: 'string',
                maxLength: 30,
                description: 'Category name',
                example: 'Adventure',
            },
            description: {
                type: 'string',
                maxLength: 100,
                nullable: true,
                description: 'Category description',
                example: 'Stories about adventures and journeys',
            },
        },
    },

    CategoryResponse: {
        type: 'object',
        required: ['categoryId', 'name', 'createdAt'],
        properties: {
            categoryId: {
                type: 'string',
                format: 'uuid',
                example: 'c1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
            },
            name: {
                type: 'string',
                example: 'Adventure',
            },
            description: {
                type: 'string',
                nullable: true,
                example: 'Stories about adventures and journeys',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-12T10:30:00Z',
            },
        },
    },

    // Admin Schemas
    UpdateRoleRequest: {
        type: 'object',
        required: ['role'],
        properties: {
            role: {
                type: 'string',
                enum: ['ADMIN', 'USER'],
                example: 'ADMIN',
            },
        },
    },

    // Error Schemas
    ApiErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
            success: {
                type: 'boolean',
                example: false,
            },
            message: {
                type: 'string',
                example: 'Error message',
            },
            errors: {
                type: 'array',
                items: {
                    type: 'object',
                },
                description: 'Additional error details',
            },
        },
    },

    ValidationErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'errors'],
        properties: {
            success: {
                type: 'boolean',
                example: false,
            },
            message: {
                type: 'string',
                example: 'Validation failed',
            },
            errors: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        field: {
                            type: 'string',
                            example: 'email',
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid email format',
                        },
                    },
                },
            },
        },
    },

    // Health Check Response
    HealthResponse: {
        type: 'object',
        required: ['status', 'message'],
        properties: {
            status: {
                type: 'string',
                enum: ['OK', 'ERROR'],
                example: 'OK',
            },
            message: {
                type: 'string',
                example: 'Server is running',
            },
        },
    },

    // Generic Success Response
    SuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
            success: {
                type: 'boolean',
                example: true,
            },
            message: {
                type: 'string',
                example: 'Operation completed successfully',
            },
        },
    },
};
