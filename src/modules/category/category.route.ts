import { auth, UserRole } from '../../middleware/auth';
import { Router } from 'express';
import { categoryController } from './category.controller';

const router = Router()


router.post('/', auth(UserRole.ADMIN), categoryController.createCategory);

export const categoryRouter = router;
