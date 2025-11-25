export const USER_RESPONSE_MESSAGES = {
  CREATED: 'User created successfully',
  UPDATED: 'User updated successfully',
  DELETED: 'User deleted successfully',
  RETRIEVED: 'User retrieved successfully',
  USERS_RETRIEVED: 'Users retrieved successfully',
  NOT_FOUND: 'User not found',
  CREATION_FAILED: 'Failed to create user',
  UPDATE_FAILED: 'Failed to update user',
  DELETE_FAILED: 'Failed to delete user',
  FETCH_FAILED: 'Failed to fetch user',
  FETCH_ALL_FAILED: 'Failed to fetch users',
} as const;

export const VALIDATION_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Internal Server Error'
} as const;
