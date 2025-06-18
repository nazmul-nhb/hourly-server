import { Router } from 'express';
import authorizeUser from '../../middlewares/authorizeUser';
import validateRequest from '../../middlewares/validateRequest';
import { shiftControllers } from './shift.controllers';
import { shiftValidations } from './shift.validation';

const router = Router();

router.post(
	'/',
	validateRequest(shiftValidations.creationSchema),
	authorizeUser('user'),
	shiftControllers.createNewShift,
);

router.get('/user', authorizeUser('user'), shiftControllers.getUserShifts);

router.patch(
	'/:id',
	validateRequest(shiftValidations.updateSchema),
	authorizeUser('user'),
	shiftControllers.updateUserShift,
);

router.delete('/:id', authorizeUser('user'), shiftControllers.deleteUserShift);

router.get(
	'/',
	authorizeUser('admin', 'super_admin'),
	shiftControllers.getAllShifts,
);

export const shiftRoutes = router;
