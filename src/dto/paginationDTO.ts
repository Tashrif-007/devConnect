import { z } from 'zod';
import { SortDirection, UserOrderBy, StoryOrderBy } from '../enums';

// Generalized schema that accepts any orderBy enum value
export const PaginationQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .pipe(z.number().int().min(1)),
    itemsPerPage: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .pipe(z.number().int().min(1).max(100)),
    find: z.string().trim().optional(),
    sortBy: z.nativeEnum(SortDirection).optional().default(SortDirection.DESC),
    orderBy: z
        .union([z.nativeEnum(UserOrderBy), z.nativeEnum(StoryOrderBy)])
        .optional()
        .default(UserOrderBy.USER_ID),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginationResult<T> {
    data: T[];
    total: number;
}

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
