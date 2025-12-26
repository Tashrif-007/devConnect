import { HttpStatus } from '../constants/httpStatus';
import { ERROR_MESSAGES } from '../constants/messages';

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
        super(message, HttpStatus.NOT_FOUND);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = ERROR_MESSAGES.VALIDATION_FAILED) {
        super(message, HttpStatus.BAD_REQUEST);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
        super(message, HttpStatus.UNAUTHORIZED);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = ERROR_MESSAGES.ACCESS_FORBIDDEN) {
        super(message, HttpStatus.FORBIDDEN);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = ERROR_MESSAGES.CONFLICT) {
        super(message, HttpStatus.CONFLICT);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = ERROR_MESSAGES.DATABASE_FAILED) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

export class OpenRouterError extends AppError {
    constructor(message: string, status: number) {
        super(message, status);
        Object.setPrototypeOf(this, OpenRouterError.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = ERROR_MESSAGES.VALIDATION_FAILED) {
        super(message, HttpStatus.BAD_REQUEST);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class CloudinaryError extends AppError {
    constructor(message: string = 'Failed to upload image to Cloudinary') {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        Object.setPrototypeOf(this, CloudinaryError.prototype);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = ERROR_MESSAGES.SERVER_ERROR) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
