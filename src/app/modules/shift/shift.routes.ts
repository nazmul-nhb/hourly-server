import { ADMIN_ROLES } from '@/constants';
import authorizeUser from '@/middlewares/authorizeUser';
import validateRequest from '@/middlewares/validateRequest';
import { shiftControllers } from '@/modules/shift/shift.controllers';
import { shiftValidations } from '@/modules/shift/shift.validation';
import { Router } from 'express';

const router = Router();

router.post(
	'/',
	validateRequest(shiftValidations.creationSchema),
	authorizeUser('user'),
	shiftControllers.createNewShift
);

router.get('/user', authorizeUser('user'), shiftControllers.getUserShifts);

router.patch(
	'/:id',
	validateRequest(shiftValidations.updateSchema),
	authorizeUser('user'),
	shiftControllers.updateUserShift
);

router.delete('/:id', authorizeUser('user'), shiftControllers.deleteUserShift);

router.get('/', authorizeUser(...ADMIN_ROLES), shiftControllers.getAllShifts);

export const shiftRoutes = router;
