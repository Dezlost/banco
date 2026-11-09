import { Router } from 'express';
import { crear, listar, movimientos, obtener } from '../controllers/cuenta.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { validarBody } from '../middlewares/validate.middleware';
import { crearCuentaSchema } from '../validators/cuenta.validator';

export const cuentasRouter = Router();

cuentasRouter.use(autenticar);

cuentasRouter.get('/', listar);
cuentasRouter.post('/', validarBody(crearCuentaSchema), crear);
cuentasRouter.get('/:id', obtener);
cuentasRouter.get('/:id/movimientos', movimientos);
