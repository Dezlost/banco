import { transaccionService } from '../services/transaccion.service';
import { asyncHandler } from '../utils/asyncHandler';
import { filtrosTransaccionSchema } from '../validators/common.validator';
import {
  DepositoInput,
  RetiroInput,
  TransferenciaInput,
} from '../validators/transaccion.validator';

/** POST /api/transacciones/deposito */
export const depositar = asyncHandler(async (req, res) => {
  const data = req.body as DepositoInput;
  const resultado = await transaccionService.depositar(req.clienteId as string, data);
  res.status(201).json({ data: resultado });
});

/** POST /api/transacciones/retiro */
export const retirar = asyncHandler(async (req, res) => {
  const data = req.body as RetiroInput;
  const resultado = await transaccionService.retirar(req.clienteId as string, data);
  res.status(201).json({ data: resultado });
});

/** POST /api/transacciones/transferencia */
export const transferir = asyncHandler(async (req, res) => {
  const data = req.body as TransferenciaInput;
  const resultado = await transaccionService.transferir(req.clienteId as string, data);
  res.status(201).json({ data: resultado });
});

/** GET /api/transacciones */
export const listar = asyncHandler(async (req, res) => {
  const filtros = filtrosTransaccionSchema.parse(req.query);
  const resultado = await transaccionService.listar(req.clienteId as string, filtros);
  res.json({ data: resultado });
});
