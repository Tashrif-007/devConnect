import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { VoteService } from '../services/voteService';
import { ResponseFormatter } from '../utils/apiResponse';
import { HttpStatus } from '../constants/httpStatus';
import { VOTE_RESPONSE_MESSAGES } from '../constants/messages';
import type { authenticatedRequest } from '../middlewares/authentication';

@injectable()
export class VoteController {
    constructor(private voteService: VoteService) {}

    addVote = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const { storyId } = req.params;
            const { voteType } = req.body;

            const result = await this.voteService.addVote(
                userId!,
                storyId,
                voteType,
            );

            res.status(HttpStatus.CREATED).json(
                ResponseFormatter.success(
                    result,
                    VOTE_RESPONSE_MESSAGES.VOTE_ADDED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getVoteStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { storyId } = req.params;

            const result = await this.voteService.getVoteStats(storyId);

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    VOTE_RESPONSE_MESSAGES.VOTE_STATS_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getUserVote = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as authenticatedRequest).decoded?.userId;
            const { storyId } = req.params;

            const result = await this.voteService.getUserVote(userId!, storyId);

            res.status(HttpStatus.OK).json(
                ResponseFormatter.success(
                    result,
                    VOTE_RESPONSE_MESSAGES.VOTE_STATS_RETRIEVED,
                ),
            );
        } catch (error) {
            next(error);
        }
    };
}
