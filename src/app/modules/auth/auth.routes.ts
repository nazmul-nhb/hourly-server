import { USER_ROLES } from '@/constants';
import authorizeUser from '@/middlewares/authorizeUser';
import validateRequest from '@/middlewares/validateRequest';
import { Router } from 'express';
import { userValidations } from '@/modules/user/user.validation';
import { authControllers } from '@/modules/auth/auth.controllers';
import { authValidations } from '@/modules/auth/auth.validation';

const router = Router();

router.post(
	'/register',
	validateRequest(userValidations.creationSchema),
	authControllers.registerUser
);

router.post('/login', validateRequest(authValidations.loginSchema), authControllers.loginUser);

router.post('/refresh-token', authControllers.refreshToken);

router.get('/profile', authorizeUser(...USER_ROLES), authControllers.getCurrentUser);

export const authRoutes = router;
