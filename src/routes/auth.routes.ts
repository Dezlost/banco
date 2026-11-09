import { Router } from 'express';
import { login, registrar } from '../controllers/auth.controller';
import { validarBody } from '../middlewares/validate.middleware';
import { loginSchema, registroSchema } from '../validators/auth.validator';

export const authRouter = Router();

authRouter.post('/register', validarBody(registroSchema), registrar);
authRouter.post('/login', validarBody(loginSchema), login);
