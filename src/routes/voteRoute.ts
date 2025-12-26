import express from 'express';
import { container } from 'tsyringe';
import { VoteController } from '../controllers/voteController';
import { authentication } from '../middlewares/authentication';
import { validateRequestBody } from '../middlewares/validateRequest';
import { CreateVoteSchema } from '../dto/voteDTO';

const voteRouter = express.Router();
const voteController = container.resolve(VoteController);

voteRouter.post(
    '/:storyId/votes',
    authentication(),
    validateRequestBody(CreateVoteSchema),
    voteController.addVote,
);

voteRouter.delete(
    '/:storyId/votes',
    authentication(),
    voteController.removeVote,
);

voteRouter.get('/:storyId/votes', voteController.getVoteStats);

voteRouter.get(
    '/:storyId/votes/me',
    authentication(),
    voteController.getUserVote,
);

export default voteRouter;
