import { Router } from 'express';
import { USER_ROLES } from '../../constants';
import authorizeUser from '../../middlewares/authorizeUser';
import { shiftControllers } from './shift.controllers';
import validateRequest from '../../middlewares/validateRequest';
import { shiftValidations } from './shift.validation';

const router = Router();

router.post(
	'/',
	validateRequest(shiftValidations.creationSchema),
	authorizeUser('user'),
	shiftControllers.createNewShift,
);

router.get(
	'/',
	authorizeUser(...Object.values(USER_ROLES)),
	shiftControllers.getAllShifts,
);

export const shiftRoutes = router;
