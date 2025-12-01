export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum UserOrderBy {
    USER_ID = 'user.userId',
    USERNAME = 'user.username',
    NAME = 'user.name',
    EMAIL = 'user.email',
    JOIN_DATE = 'user.joinDate',
}

export enum StoryOrderBy {
    STORY_ID = 'story.storyId',
    TITLE = 'story.title',
    CREATED_AT = 'story.createdAt',
    UPDATED_AT = 'story.updatedAt',
}

// Generalized OrderBy type that combines all entity order by options
export type OrderBy = UserOrderBy | StoryOrderBy;
