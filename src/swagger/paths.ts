/**
 * OpenAPI 3.0 Paths Definitions
 * Complete endpoint documentation for all API routes with rate-limiting headers
 */

export const paths = {
    // ============================================================================
    // AUTH ENDPOINTS
    // ============================================================================
    '/api/v1/auth/signup': {
        post: {
            tags: ['Auth'],
            summary: 'Register a new user',
            description:
                'Create a new user account with email confirmation. A confirmation email will be sent to the provided email address.',
            operationId: 'registerUser',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SignupRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    username: 'john_doe',
                                    name: 'John Doe',
                                    email: 'john@example.com',
                                    password: 'SecurePass123!',
                                    confirmPassword: 'SecurePass123!',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'User registered successfully',
                    headers: {
                        'x-rate-limit-limit': {
                            schema: { type: 'integer' },
                            description: 'Request limit per window',
                        },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                            description: 'Remaining requests in window',
                        },
                        'x-rate-limit-reset': {
                            schema: { type: 'integer' },
                            description:
                                'Unix timestamp when the rate limit resets',
                        },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AuthResponse',
                            },
                            examples: {
                                success: {
                                    value: {
                                        success: true,
                                        message: 'User registered successfully',
                                        data: {
                                            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                            user: {
                                                userId: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
                                                username: 'john_doe',
                                                name: 'John Doe',
                                                email: 'john@example.com',
                                                joinDate:
                                                    '2025-12-12T10:30:00Z',
                                                isEmailConfirmed: false,
                                                role: 'USER',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '409': {
                    $ref: '#/components/responses/Conflict',
                },
                '429': {
                    $ref: '#/components/responses/TooManyRequests',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'User login',
            description:
                'Authenticate a user with email and password. Returns JWT token on successful authentication.',
            operationId: 'loginUser',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/LoginRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    email: 'john@example.com',
                                    password: 'SecurePass123!',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'User logged in successfully',
                    headers: {
                        'x-rate-limit-limit': {
                            schema: { type: 'integer' },
                            description: 'Request limit per window',
                        },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                            description: 'Remaining requests in window',
                        },
                        'x-rate-limit-reset': {
                            schema: { type: 'integer' },
                            description:
                                'Unix timestamp when the rate limit resets',
                        },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AuthResponse',
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    description: 'Invalid email or password',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                            examples: {
                                invalidCredentials: {
                                    value: {
                                        success: false,
                                        message: 'Invalid email or password',
                                    },
                                },
                            },
                        },
                    },
                },
                '429': {
                    $ref: '#/components/responses/TooManyRequests',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/confirm-email': {
        get: {
            tags: ['Auth'],
            summary: 'Confirm user email',
            description:
                'Verify user email using the confirmation token sent via email.',
            operationId: 'confirmEmail',
            parameters: [
                {
                    name: 'token',
                    in: 'query',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Email confirmation token from email link',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            ],
            responses: {
                '200': {
                    description: 'Email confirmed successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                            examples: {
                                success: {
                                    value: {
                                        success: true,
                                        message: 'Email confirmed successfully',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    description: 'Invalid or expired token',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                        },
                    },
                },
                '429': {
                    $ref: '#/components/responses/TooManyRequests',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/resend-confirmation-email': {
        post: {
            tags: ['Auth'],
            summary: 'Resend confirmation email',
            description:
                "Resend the email confirmation link to the user's email address.",
            operationId: 'resendConfirmationEmail',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ResendConfirmationEmailRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    email: 'john@example.com',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Confirmation email sent successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                            examples: {
                                success: {
                                    value: {
                                        success: true,
                                        message:
                                            'Confirmation email sent successfully',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '429': {
                    $ref: '#/components/responses/TooManyRequests',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/change-password': {
        post: {
            tags: ['Auth'],
            summary: 'Request password change',
            description:
                'Initiate password change process. Requires current password verification. Generates a session token and sends confirmation code via email.',
            operationId: 'requestPasswordChange',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ChangePasswordRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    password: 'CurrentPass123!',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Password change requested successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Confirmation code sent to your email',
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            sessionToken: {
                                                type: 'string',
                                                description:
                                                    'Token to use with validate-code endpoint',
                                                example:
                                                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/validate-code': {
        post: {
            tags: ['Auth'],
            summary: 'Validate confirmation code',
            description:
                "Validate the confirmation code sent to the user's email during password change request.",
            operationId: 'validateCode',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ValidateCodeRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    confirmationCode: '123456',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Code validated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                        },
                    },
                },
                '400': {
                    description: 'Invalid or expired code',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ApiErrorResponse',
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/auth/update-password': {
        post: {
            tags: ['Auth'],
            summary: 'Update password with session token',
            description:
                'Complete password change by providing new password and the session token obtained from validate-code endpoint.',
            operationId: 'updatePassword',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdatePasswordWithTokenRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    newPassword: 'NewSecurePass456!',
                                    sessionToken:
                                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Password updated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                            examples: {
                                success: {
                                    value: {
                                        success: true,
                                        message:
                                            'Password changed successfully',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    // ============================================================================
    // USER ENDPOINTS
    // ============================================================================
    '/api/v1/users/profile': {
        get: {
            tags: ['Users'],
            summary: 'Get user profile',
            description:
                "Retrieve the authenticated user's profile information.",
            operationId: 'getProfile',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Profile retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Profile retrieved successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        put: {
            tags: ['Users'],
            summary: 'Update user profile',
            description:
                "Update the authenticated user's profile information (name and profile picture).",
            operationId: 'updateProfile',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateProfileRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    name: 'John Updated Doe',
                                    profilePictureUrl:
                                        'https://example.com/new-profile.jpg',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Profile updated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'Profile updated successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/users': {
        get: {
            tags: ['Users'],
            summary: 'Get all users',
            description:
                'Retrieve a paginated list of all users with optional search, filtering, and sorting. Requires authentication.',
            operationId: 'getAllUsers',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    schema: { type: 'integer', minimum: 1, default: 1 },
                    description: 'Page number',
                },
                {
                    name: 'itemsPerPage',
                    in: 'query',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                    },
                    description: 'Items per page',
                },
                {
                    name: 'find',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Search term (searches username, name, email)',
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    schema: {
                        type: 'string',
                        enum: ['ASC', 'DESC'],
                        default: 'DESC',
                    },
                    description: 'Sort direction',
                },
                {
                    name: 'orderBy',
                    in: 'query',
                    schema: {
                        type: 'string',
                        enum: [
                            'USER_ID',
                            'USERNAME',
                            'NAME',
                            'EMAIL',
                            'JOIN_DATE',
                        ],
                        default: 'USER_ID',
                    },
                    description: 'Field to sort by',
                },
            ],
            responses: {
                '200': {
                    description: 'Users retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PaginatedUserResponse',
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/users/{userId}': {
        get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            description: "Retrieve a specific user's information by their ID.",
            operationId: 'getUserById',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'User ID (UUID)',
                    example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
                },
            ],
            responses: {
                '200': {
                    description: 'User retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'User retrieved successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        put: {
            tags: ['Users'],
            summary: 'Update user',
            description:
                "Update a specific user's information. Only the user themselves or an admin can update a user.",
            operationId: 'updateUser',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'User ID (UUID)',
                    example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateUserRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    name: 'Jane Doe',
                                    isEmailConfirmed: true,
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'User updated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'User updated successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        delete: {
            tags: ['Users'],
            summary: 'Delete user',
            description:
                'Delete a specific user. Only the user themselves or an admin can delete a user.',
            operationId: 'deleteUser',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'User ID (UUID)',
                    example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
                },
            ],
            responses: {
                '204': {
                    description: 'User deleted successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    // ============================================================================
    // STORY ENDPOINTS
    // ============================================================================
    '/api/v1/stories': {
        post: {
            tags: ['Stories'],
            summary: 'Create a new story',
            description:
                'Create a new story with optional categories. Can optionally skip AI summary generation by setting skip to true.',
            operationId: 'createStory',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/CreateStoryRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    title: 'My First Story',
                                    body: 'This is the content of my story...',
                                    categoryIds: [
                                        'c1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                                    ],
                                    skip: false,
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Story created successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'Story created successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/StoryResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        get: {
            tags: ['Stories'],
            summary: 'Get all stories',
            description:
                'Retrieve a paginated list of all stories with optional search, category filtering, and sorting. No authentication required.',
            operationId: 'getAllStories',
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    schema: { type: 'integer', minimum: 1, default: 1 },
                    description: 'Page number',
                },
                {
                    name: 'itemsPerPage',
                    in: 'query',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                    },
                    description: 'Items per page',
                },
                {
                    name: 'find',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Search term (searches title and body)',
                },
                {
                    name: 'category',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Filter by category name',
                },
                {
                    name: 'sortBy',
                    in: 'query',
                    schema: {
                        type: 'string',
                        enum: ['ASC', 'DESC'],
                        default: 'DESC',
                    },
                    description: 'Sort direction',
                },
                {
                    name: 'orderBy',
                    in: 'query',
                    schema: {
                        type: 'string',
                        enum: ['STORY_ID', 'TITLE', 'CREATED_AT', 'UPDATED_AT'],
                        default: 'STORY_ID',
                    },
                    description: 'Field to sort by',
                },
            ],
            responses: {
                '200': {
                    description: 'Stories retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/PaginatedStoryResponse',
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/stories/{storyId}': {
        get: {
            tags: ['Stories'],
            summary: 'Get story by ID',
            description:
                "Retrieve a specific story's details by its ID. No authentication required.",
            operationId: 'getStoryById',
            parameters: [
                {
                    name: 'storyId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Story ID (UUID)',
                    example: 's1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                },
            ],
            responses: {
                '200': {
                    description: 'Story retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'Story retrieved successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/StoryResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        put: {
            tags: ['Stories'],
            summary: 'Update story',
            description:
                "Update a specific story's information. Only the story owner can update their story.",
            operationId: 'updateStory',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'storyId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Story ID (UUID)',
                    example: 's1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateStoryRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    title: 'Updated Story Title',
                                    body: 'Updated story content...',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'Story updated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example: 'Story updated successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/StoryResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        delete: {
            tags: ['Stories'],
            summary: 'Delete story',
            description:
                'Delete a specific story. Only the story owner can delete their story.',
            operationId: 'deleteStory',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'storyId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Story ID (UUID)',
                    example: 's1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                },
            ],
            responses: {
                '200': {
                    description: 'Story deleted successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse',
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/stories/{storyId}/regenerate-summary': {
        post: {
            tags: ['Stories'],
            summary: 'Regenerate AI summary',
            description:
                'Regenerate the AI summary for a story. Only the story owner can regenerate their summary.',
            operationId: 'regenerateSummary',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'storyId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Story ID (UUID)',
                    example: 's1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                },
            ],
            responses: {
                '200': {
                    description: 'Summary regenerated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Summary regenerated successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/StoryResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    // ============================================================================
    // CATEGORY ENDPOINTS
    // ============================================================================
    '/api/v1/categories': {
        post: {
            tags: ['Categories'],
            summary: 'Create category',
            description:
                'Create a new story category. Only admins can create categories.',
            operationId: 'createCategory',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/CategoryRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    name: 'Adventure',
                                    description:
                                        'Stories about adventures and journeys',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '201': {
                    description: 'Category created successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Category created successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/CategoryResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
        get: {
            tags: ['Categories'],
            summary: 'Get all categories',
            description: 'Retrieve a list of all available story categories.',
            operationId: 'getAllCategories',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Categories retrieved successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'Categories retrieved successfully',
                                    },
                                    data: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/CategoryResponse',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    '/api/v1/categories/{categoryId}': {
        delete: {
            tags: ['Categories'],
            summary: 'Delete category',
            description:
                'Delete a specific category. Only admins can delete categories.',
            operationId: 'deleteCategory',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'categoryId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Category ID (UUID)',
                    example: 'c1a2b3c4-d5e6-4f7g-8h9i-j0k1l2m3n4o5',
                },
            ],
            responses: {
                '204': {
                    description: 'Category deleted successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    // ============================================================================
    // ADMIN ENDPOINTS
    // ============================================================================
    '/api/v1/admin/role/{userId}': {
        patch: {
            tags: ['Admin'],
            summary: 'Update user role',
            description:
                "Update a user's role (ADMIN or USER). Only admins can perform this action.",
            operationId: 'updateUserRole',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'User ID (UUID)',
                    example: 'd1c3b2a1-0f4e-4c3b-8a2d-1e0f3c2b1a0d',
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UpdateRoleRequest',
                        },
                        examples: {
                            success: {
                                value: {
                                    role: 'ADMIN',
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                '200': {
                    description: 'User role updated successfully',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: {
                                        type: 'string',
                                        example:
                                            'User role updated successfully',
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                '400': {
                    $ref: '#/components/responses/ValidationError',
                },
                '401': {
                    $ref: '#/components/responses/Unauthorized',
                },
                '403': {
                    $ref: '#/components/responses/Forbidden',
                },
                '404': {
                    $ref: '#/components/responses/NotFound',
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },

    // ============================================================================
    // HEALTH CHECK ENDPOINT
    // ============================================================================
    '/api/v1/health': {
        get: {
            tags: ['Health'],
            summary: 'Health check',
            description:
                'Check if the API server is running and healthy. No authentication required.',
            operationId: 'healthCheck',
            responses: {
                '200': {
                    description: 'Server is healthy',
                    headers: {
                        'x-rate-limit-limit': { schema: { type: 'integer' } },
                        'x-rate-limit-remaining': {
                            schema: { type: 'integer' },
                        },
                        'x-rate-limit-reset': { schema: { type: 'integer' } },
                    },
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/HealthResponse',
                            },
                            examples: {
                                success: {
                                    value: {
                                        status: 'OK',
                                        message: 'Server is running',
                                    },
                                },
                            },
                        },
                    },
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError',
                },
            },
        },
    },
};
