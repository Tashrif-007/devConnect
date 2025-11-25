const createResourceMessages = (resourceName: string) => ({
    CREATED: `${resourceName} created successfully`,
    UPDATED: `${resourceName} updated successfully`,
    DELETED: `${resourceName} deleted successfully`,
    RETRIEVED: `${resourceName} retrieved successfully`,
    ALL_RETRIEVED: `${resourceName}s retrieved successfully`,
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

export const ERROR_MESSAGES = {
    CONFLICT: 'Resource Conflict',
    DATABASE_FAILED: 'Database operation failed',
    ACCESS_FORBIDDEN: 'Access forbidden',
    RESOURCE_NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    VALIDATION_FAILED: 'Validation failed',
    SERVER_ERROR: 'Internal Server Error',
} as const;

export const VALIDATION_MESSAGES = {
    VALIDATION_FAILED: 'Validation failed',
} as const;

export const ERROR_MESSAGES = {
  CONFLICT: 'Resource Conflict',
  DATABASE_FAILED: 'Database operation failed',
  ACCESS_FORBIDDEN: 'Access forbidden',
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Internal Server Error',
} as const;
