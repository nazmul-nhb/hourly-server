import { Router } from 'express';
import { userControllers } from './user.controllers';

const router = Router();

router.get('/', userControllers.getAllUsers);

export const userRoutes = router;
