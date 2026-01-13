import { z } from 'zod';
import { BaseResponseDTO } from './baseDTO';
import { Exclude, Expose, Transform } from 'class-transformer';
import { VoteType } from '../enums/voteType';

export const CreateVoteSchema = z.object({
    voteType: z.enum(VoteType),
});

export const RemoveVoteSchema = z.object({
    storyId: z.uuid('Invalid story ID'),
});

export const GetVoteParamSchema = z.object({
    storyId: z.uuid('Invalid story ID'),
});

export type CreateVotePayload = z.infer<typeof CreateVoteSchema>;
export type RemoveVotePayload = z.infer<typeof RemoveVoteSchema>;
export type GetVoteParam = z.infer<typeof GetVoteParamSchema>;

@Exclude()
export class VoteResponseDTO extends BaseResponseDTO {
    @Expose()
    voteId: string;

    @Expose()
    voteType: VoteType;

    @Expose()
    createdAt: Date;

    @Expose()
    @Transform(({ obj }) => ({
        userId: obj.user?.userId,
        name: obj.user?.name,
        username: obj.user?.username,
    }))
    user: {
        userId: string;
        name: string;
        username: string;
    };
}

@Exclude()
export class VoteCountResponseDTO {
    @Expose()
    upvotes: number;

    @Expose()
    downvotes: number;

    @Expose()
    userVote?: VoteType | null;
}
