import { cuentaService } from '../services/cuenta.service';
import { asyncHandler } from '../utils/asyncHandler';
import { filtrosTransaccionSchema } from '../validators/common.validator';
import { CrearCuentaInput } from '../validators/cuenta.validator';

/** GET /api/cuentas */
export const listar = asyncHandler(async (req, res) => {
  const cuentas = await cuentaService.listar(req.clienteId as string);
  res.json({ data: cuentas });
});

/** POST /api/cuentas */
export const crear = asyncHandler(async (req, res) => {
  const { tipo } = req.body as CrearCuentaInput;
  const cuenta = await cuentaService.crear(req.clienteId as string, tipo);
  res.status(201).json({ data: cuenta });
});

/** GET /api/cuentas/:id */
export const obtener = asyncHandler(async (req, res) => {
  const cuenta = await cuentaService.obtener(String(req.params.id), req.clienteId as string);
  res.json({ data: cuenta });
});

/** GET /api/cuentas/:id/movimientos */
export const movimientos = asyncHandler(async (req, res) => {
  const filtros = filtrosTransaccionSchema.parse(req.query);
  const resultado = await cuentaService.movimientos(
    String(req.params.id),
    req.clienteId as string,
    filtros,
  );
  res.json({ data: resultado });
});
