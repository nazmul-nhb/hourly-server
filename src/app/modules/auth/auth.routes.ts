import { Router } from 'express';
import { USER_ROLES } from '../../constants';
import authorizeUser from '../../middlewares/authorizeUser';
import validateRequest from '../../middlewares/validateRequest';
import { userValidations } from '../user/user.validation';
import { authControllers } from './auth.controllers';
import { authValidations } from './auth.validation';

const router = Router();

router.post(
	'/register',
	validateRequest(userValidations.creationSchema),
	authControllers.registerUser,
);

router.post(
	'/login',
	validateRequest(authValidations.loginSchema),
	authControllers.loginUser,
);

router.post('/refresh-token', authControllers.refreshToken);

router.get(
	'/profile',
	authorizeUser(...Object.values(USER_ROLES)),
	authControllers.getCurrentUser,
);

export const authRoutes = router;
