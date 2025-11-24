export const USER_RESPONSE_MESSAGES = {
  CREATED: 'User created successfully',
  UPDATED: 'User updated successfully',
  DELETED: 'User deleted successfully',
  RETRIEVED: 'User retrieved successfully',
  USERS_RETRIEVED: 'Users retrieved successfully',
  NOT_FOUND: 'User not found',
  USERNAME_EXISTS: 'Username already exists',
  EMAIL_EXISTS: 'Email already exists',
  CREATION_FAILED: 'Failed to create user',
  UPDATE_FAILED: 'Failed to update user',
  DELETE_FAILED: 'Failed to delete user',
  FETCH_FAILED: 'Failed to fetch user',
  FETCH_ALL_FAILED: 'Failed to fetch users',
} as const;

export const VALIDATION_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Internal Server Error',
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
