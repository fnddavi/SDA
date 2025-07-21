import { Router } from 'express';
import { registrarLogin } from '../controllers/loginController';

const router = Router();

router.post('/login', registrarLogin);

export default router;
