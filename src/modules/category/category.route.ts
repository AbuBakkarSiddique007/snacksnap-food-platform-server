import { auth, UserRole } from '../../middleware/auth';
import { Router } from 'express';
import { categoryController } from './category.controller';

const router = Router()

router.get('/', categoryController.getCategories);
router.post('/', auth(UserRole.PROVIDER), categoryController.createCategory);


export const categoryRouter = router;
