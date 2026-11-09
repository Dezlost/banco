import { Router } from 'express';
import { obtenerPerfil } from '../controllers/cliente.controller';
import { autenticar } from '../middlewares/auth.middleware';

export const clientesRouter = Router();

clientesRouter.get('/me', autenticar, obtenerPerfil);
