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

export const VOTE_RESPONSE_MESSAGES = {
    VOTE_ADDED: 'Vote added successfully',
    VOTE_REMOVED: 'Vote removed successfully',
    VOTE_UPDATED: 'Vote updated successfully',
    VOTE_NOT_FOUND: 'Vote not found',
    VOTE_ALREADY_EXISTS: 'You have already voted on this post',
    VOTE_STATS_RETRIEVED: 'Vote statistics retrieved successfully',
};

export const COMMENT_RESPONSE_MESSAGES = {
    COMMENT_CREATED: 'Comment created successfully',
    COMMENT_UPDATED: 'Comment updated successfully',
    COMMENT_DELETED: 'Comment deleted successfully',
    COMMENT_NOT_FOUND: 'Comment not found',
    COMMENTS_RETRIEVED: 'Comments retrieved successfully',
};

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
    PASSWORD_CHANGE_REQUESTED: 'Password change requested successfully',
    CODE_VALIDATED: 'Code validated successfully',
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
    BAD_GATEWAY: 'Request Failed. Please try later.',
    USED: 'Code Already Used',
    EXPIRED: 'Code has expired',
    EMAIL_CONFIRMED_ALREADY: 'Email is already confirmed',
    INVALID_CODE: 'Invalid code',
} as const;

export const VALIDATION_MESSAGES = {
    VALIDATION_FAILED: 'Validation failed',
} as const;
