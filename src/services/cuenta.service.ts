import { randomInt } from 'node:crypto';
import { Cuenta, TipoCuenta } from '@prisma/client';
import { cuentaModel } from '../models/cuenta.model';
import { FiltrosTransaccion } from '../types/filtros';
import { ApiError } from '../utils/ApiError';
import { serializarCuenta, serializarTransaccion } from '../utils/serializers';

const MAX_INTENTOS_NUMERO_CUENTA = 5;

/** Genera un número de cuenta numérico de 10 dígitos. */
function generarNumeroCuenta(): string {
  return randomInt(1_000_000_000, 9_999_999_999).toString();
}

/** Busca una cuenta y valida que pertenezca al cliente autenticado. */
async function obtenerCuentaPropia(id: string, clienteId: string): Promise<Cuenta> {
  const cuenta = await cuentaModel.buscarPorId(id);

  if (!cuenta) {
    throw new ApiError(404, 'Cuenta no encontrada');
  }

  if (cuenta.clienteId !== clienteId) {
    throw new ApiError(403, 'No tenés acceso a esta cuenta');
  }

  return cuenta;
}

export const cuentaService = {
  async listar(clienteId: string) {
    const cuentas = await cuentaModel.listarPorCliente(clienteId);
    return cuentas.map(serializarCuenta);
  },

  async obtener(id: string, clienteId: string) {
    const cuenta = await obtenerCuentaPropia(id, clienteId);
    return serializarCuenta(cuenta);
  },

  async crear(clienteId: string, tipo: TipoCuenta) {
    for (let intento = 0; intento < MAX_INTENTOS_NUMERO_CUENTA; intento++) {
      const numeroCuenta = generarNumeroCuenta();
      const existente = await cuentaModel.buscarPorNumero(numeroCuenta);

      if (existente) {
        continue;
      }

      const cuenta = await cuentaModel.crear({ numeroCuenta, tipo, clienteId });
      return serializarCuenta(cuenta);
    }

    throw new ApiError(500, 'No se pudo generar un número de cuenta único');
  },

  async movimientos(id: string, clienteId: string, filtros: FiltrosTransaccion) {
    await obtenerCuentaPropia(id, clienteId);
    const movimientos = await cuentaModel.listarMovimientos(id, filtros);
    return movimientos.map(serializarTransaccion);
  },
};
