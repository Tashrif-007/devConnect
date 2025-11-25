export interface CreateStoryDto {
    title: string;
    body: string;
    userId: string;
}

export interface UpdateStoryDto {
    title?: string;
    body?: string;
}

export interface StoryResponseDto {
    storyId: string;
    title: string;
    body: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
