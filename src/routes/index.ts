import { Router } from 'express';
import { authRouter } from './auth.routes';
import { clientesRouter } from './clientes.routes';
import { cuentasRouter } from './cuentas.routes';
import { transaccionesRouter } from './transacciones.routes';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/clientes', clientesRouter);
routes.use('/cuentas', cuentasRouter);
routes.use('/transacciones', transaccionesRouter);
