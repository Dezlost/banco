import { clienteModel } from '../models/cliente.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { serializarCliente } from '../utils/serializers';

/** GET /api/clientes/me */
export const obtenerPerfil = asyncHandler(async (req, res) => {
  const cliente = await clienteModel.buscarPorId(req.clienteId as string);

  if (!cliente) {
    throw new ApiError(404, 'Cliente no encontrado');
  }

  res.json({ data: serializarCliente(cliente) });
});
