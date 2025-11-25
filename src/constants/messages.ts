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

export const VALIDATION_MESSAGES = {
    VALIDATION_FAILED: 'Validation failed',
} as const;
