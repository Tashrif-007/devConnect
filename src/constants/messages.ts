const createResourceMessages = (resourceName: string) => ({
    CREATED: `${resourceName} created successfully`,
    UPDATED: `${resourceName} updated successfully`,
    DELETED: `${resourceName} deleted successfully`,
    RETRIEVED: `${resourceName} retrieved successfully`,
    ALL_RETRIEVED: `${resourceName}(s) retrieved successfully`,
    NOT_FOUND: `${resourceName} not found`,
    CREATION_FAILED: `Failed to create ${resourceName.toLowerCase()}`,
    UPDATE_FAILED: `Failed to update ${resourceName.toLowerCase()}`,
    DELETE_FAILED: `Failed to delete ${resourceName.toLowerCase()}`,
    FETCH_FAILED: `Failed to fetch ${resourceName.toLowerCase()}`,
    FETCH_ALL_FAILED: `Failed to fetch ${resourceName.toLowerCase()}s`,
});

export const USER_RESPONSE_MESSAGES = {
    ...createResourceMessages('User'),
    USERNAME_EXISTS: 'Username already exists',
    EMAIL_EXISTS: 'Email already exists',
};

export const STORY_RESPONSE_MESSAGES = createResourceMessages('Story');

export const CATEGORY_RESPONSE_MESSAGES = createResourceMessages('Category');

export const SUMMARY_RESPONSE_MESSAGES = createResourceMessages('Summary');

export const AUTH_RESPONSE_MESSAGES = {
    SIGNUP_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_NOT_MATCHED: 'Password and confirm password does not match',
    EMAIL_CONFIRMATION_SENT: 'Confirmation email sent successfully',
    EMAIL_CONFIRMED: 'Email confirmed successfully',
    EMAIL_NOT_CONFIRMED: 'Please confirm your email before logging in',
    INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired confirmation token',
    CONFIRMATION_EMAIL_RESENT: 'Confirmation email resent successfully',
};

export const RATE_LIMIT_MESSAGES = {
    TOO_MANY_REQUESTS: 'Too many requests sent',
};

export const ERROR_MESSAGES = {
    CONFLICT: 'Resource Conflict',
    DATABASE_FAILED: 'Database operation failed',
    ACCESS_FORBIDDEN: 'Access forbidden',
    RESOURCE_NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    HEADER_MISSING: 'Authorized header is missing',
    INVALID_HEADER: 'Invalid auth header',
    TOKEN_MISSING: 'Auth token missing',
    VALIDATION_FAILED: 'Invalid password',
    INVALID_TOKEN: 'Token invalid',
    SERVER_ERROR: 'Internal Server Error',
    INVALID_CATEGORY_ID: 'Invalid category id provided',
    BAD_GATEWAY: 'Request Failed. Please try later.'
} as const;

export const VALIDATION_MESSAGES = {
    VALIDATION_FAILED: 'Validation failed',
} as const;
