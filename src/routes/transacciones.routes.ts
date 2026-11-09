import { Router } from 'express';
import { depositar, listar, retirar, transferir } from '../controllers/transaccion.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { validarBody } from '../middlewares/validate.middleware';
import {
  depositoSchema,
  retiroSchema,
  transferenciaSchema,
} from '../validators/transaccion.validator';

export const transaccionesRouter = Router();

transaccionesRouter.use(autenticar);

transaccionesRouter.get('/', listar);
transaccionesRouter.post('/deposito', validarBody(depositoSchema), depositar);
transaccionesRouter.post('/retiro', validarBody(retiroSchema), retirar);
transaccionesRouter.post('/transferencia', validarBody(transferenciaSchema), transferir);
