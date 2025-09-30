import { Router } from 'express';
import { userControllers } from '@/modules/user/user.controllers';

const router = Router();

router.get('/', userControllers.getAllUsers);

export const userRoutes = router;
