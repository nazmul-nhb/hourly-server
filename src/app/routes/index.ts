import { authRoutes } from '@/modules/auth/auth.routes';
import { shiftRoutes } from '@/modules/shift/shift.routes';
import { userRoutes } from '@/modules/user/user.routes';
import type { IRoute } from '@/types/interfaces';
import { Router } from 'express';

const router = Router();

const routes: IRoute[] = [
	{ path: '/auth', route: authRoutes },
	{ path: '/users', route: userRoutes },
	{ path: '/shifts', route: shiftRoutes },
];

routes.forEach((item) => router.use(item.path, item.route));

export default router;
