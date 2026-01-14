import express from 'express';
import { container } from 'tsyringe';
import { VoteController } from '../controllers/voteController';
import { authentication } from '../middlewares/authentication';
import { validateRequestBody } from '../middlewares/validateRequest';
import { readLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { CreateVoteSchema } from '../dto/voteDTO';

const voteRouter = express.Router();
const voteController = container.resolve(VoteController);

voteRouter.post(
    '/:storyId/votes',
    writeLimiter,
    authentication(),
    validateRequestBody(CreateVoteSchema),
    voteController.addVote,
);

voteRouter.get('/:storyId/votes', readLimiter, voteController.getVoteStats);

voteRouter.get(
    '/:storyId/votes/me',
    readLimiter,
    authentication(),
    voteController.getUserVote,
);

export default voteRouter;
