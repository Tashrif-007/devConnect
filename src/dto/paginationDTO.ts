import { z } from 'zod';
import { Exclude, Expose, Type } from 'class-transformer';
import { SortDirection, UserOrderBy, StoryOrderBy } from '../enums';
import { BaseResponseDTO } from './baseDTO';

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
    sortBy: z.enum(SortDirection).optional().default(SortDirection.DESC),
    orderBy: z
        .union([z.enum(UserOrderBy), z.enum(StoryOrderBy)])
        .optional()
        .default(UserOrderBy.USER_ID),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

@Exclude()
export class PaginatedResponseDTO<T> extends BaseResponseDTO {
    @Expose()
    @Type(() => Object)
    data: T[];

    @Expose()
    @Type(() => Object)
    pagination: PaginationMeta;

    constructor(data: T[], pagination: PaginationMeta) {
        super();
        this.data = data;
        this.pagination = pagination;
    }
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    itemsPerPage: number,
): PaginatedResponseDTO<T> {
    const totalPages = Math.ceil(total / itemsPerPage);
    const pagination: PaginationMeta = {
        currentPage: page,
        itemsPerPage,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
    return new PaginatedResponseDTO(data, pagination);
}
