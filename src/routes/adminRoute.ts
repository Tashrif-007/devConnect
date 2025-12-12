import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authentication } from '../middlewares/authentication';
import { checkRequiredRoles } from '../middlewares/authorization';
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/validateRequest';
import { UpdateRoleSchema } from '../dto/userDTO';
import { UserIdParamSchema } from '../dto/userDTO';
import { UserRole } from '../enums';
import { container } from 'tsyringe';

const adminRouter = express.Router();
const adminController = container.resolve(AdminController);

adminRouter.patch(
    '/role/:userId',
    validateRequestBody(UpdateRoleSchema),
    validateRequestParams(UserIdParamSchema),
    authentication(),
    checkRequiredRoles([UserRole.ADMIN]),
    adminController.updateUserRole,
);

export default adminRouter;
