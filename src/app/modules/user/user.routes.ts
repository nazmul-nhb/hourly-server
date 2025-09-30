import { userControllers } from '@/modules/user/user.controllers';
import { Router } from 'express';

const router = Router();

router.get('/', userControllers.getAllUsers);

export const userRoutes = router;
