import { Cuenta } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { cuentaModel } from '../models/cuenta.model';
import { transaccionModel } from '../models/transaccion.model';
import { FiltrosTransaccion } from '../types/filtros';
import { ApiError } from '../utils/ApiError';
import { serializarCuenta, serializarTransaccion } from '../utils/serializers';
import {
  DepositoInput,
  RetiroInput,
  TransferenciaInput,
} from '../validators/transaccion.validator';

/** Rechaza operaciones sobre cuentas bloqueadas. */
function validarCuentaActiva(cuenta: Cuenta): void {
  if (cuenta.estado !== 'ACTIVA') {
    throw new ApiError(400, `La cuenta ${cuenta.numeroCuenta} está bloqueada`);
  }
}

function validarPropiedad(cuenta: Cuenta, clienteId: string): void {
  if (cuenta.clienteId !== clienteId) {
    throw new ApiError(403, 'No tenés acceso a esta cuenta');
  }
}

export const transaccionService = {
  /** Depósito: incremento atómico del saldo. */
  async depositar(clienteId: string, data: DepositoInput) {
    return prisma.$transaction(async (tx) => {
      const cuenta = await cuentaModel.buscarPorId(data.cuentaId, tx);

      if (!cuenta) {
        throw new ApiError(404, 'Cuenta no encontrada');
      }

      validarPropiedad(cuenta, clienteId);
      validarCuentaActiva(cuenta);

      const actualizada = await cuentaModel.incrementarSaldo(data.cuentaId, data.monto, tx);

      const transaccion = await transaccionModel.crear(
        {
          tipo: 'DEPOSITO',
          monto: data.monto,
          saldoResultante: actualizada.saldo,
          descripcion: data.descripcion,
          cuentaDestinoId: cuenta.id,
        },
        tx,
      );

      return {
        cuenta: serializarCuenta(actualizada),
        transaccion: serializarTransaccion(transaccion),
      };
    });
  },

  /** Retiro: decremento atómico y condicional para evitar saldos negativos. */
  async retirar(clienteId: string, data: RetiroInput) {
    return prisma.$transaction(async (tx) => {
      const cuenta = await cuentaModel.buscarPorId(data.cuentaId, tx);

      if (!cuenta) {
        throw new ApiError(404, 'Cuenta no encontrada');
      }

      validarPropiedad(cuenta, clienteId);
      validarCuentaActiva(cuenta);

      if (cuenta.saldo.lt(data.monto)) {
        throw new ApiError(400, 'Saldo insuficiente');
      }

      const resultado = await cuentaModel.decrementarSiAlcanza(data.cuentaId, data.monto, tx);

      if (resultado.count === 0) {
        throw new ApiError(409, 'La operación no se pudo completar, intentá nuevamente');
      }

      const actualizada = await cuentaModel.buscarPorId(data.cuentaId, tx);

      if (!actualizada) {
        throw new ApiError(500, 'No se pudo leer la cuenta actualizada');
      }

      const transaccion = await transaccionModel.crear(
        {
          tipo: 'RETIRO',
          monto: data.monto,
          saldoResultante: actualizada.saldo,
          descripcion: data.descripcion,
          cuentaOrigenId: cuenta.id,
        },
        tx,
      );

      return {
        cuenta: serializarCuenta(actualizada),
        transaccion: serializarTransaccion(transaccion),
      };
    });
  },

  /** Transferencia: débito y crédito dentro de la misma transacción de BD. */
  async transferir(clienteId: string, data: TransferenciaInput) {
    if (data.cuentaOrigenId === data.cuentaDestinoId) {
      throw new ApiError(400, 'La cuenta de origen y la de destino deben ser distintas');
    }

    return prisma.$transaction(async (tx) => {
      const origen = await cuentaModel.buscarPorId(data.cuentaOrigenId, tx);

      if (!origen) {
        throw new ApiError(404, 'Cuenta de origen no encontrada');
      }

      validarPropiedad(origen, clienteId);
      validarCuentaActiva(origen);

      const destino = await cuentaModel.buscarPorId(data.cuentaDestinoId, tx);

      if (!destino) {
        throw new ApiError(404, 'Cuenta de destino no encontrada');
      }

      validarCuentaActiva(destino);

      if (origen.saldo.lt(data.monto)) {
        throw new ApiError(400, 'Saldo insuficiente');
      }

      const debito = await cuentaModel.decrementarSiAlcanza(data.cuentaOrigenId, data.monto, tx);

      if (debito.count === 0) {
        throw new ApiError(409, 'La operación no se pudo completar, intentá nuevamente');
      }

      const origenActualizada = await cuentaModel.buscarPorId(data.cuentaOrigenId, tx);

      if (!origenActualizada) {
        throw new ApiError(500, 'No se pudo leer la cuenta de origen actualizada');
      }

      const destinoActualizada = await cuentaModel.incrementarSaldo(
        data.cuentaDestinoId,
        data.monto,
        tx,
      );

      const transaccion = await transaccionModel.crear(
        {
          tipo: 'TRANSFERENCIA',
          monto: data.monto,
          saldoResultante: origenActualizada.saldo,
          descripcion: data.descripcion,
          cuentaOrigenId: origen.id,
          cuentaDestinoId: destino.id,
        },
        tx,
      );

      return {
        cuentaOrigen: serializarCuenta(origenActualizada),
        cuentaDestino: serializarCuenta(destinoActualizada),
        transaccion: serializarTransaccion(transaccion),
      };
    });
  },

  async listar(clienteId: string, filtros: FiltrosTransaccion) {
    const transacciones = await transaccionModel.listarPorCliente(clienteId, filtros);
    return transacciones.map(serializarTransaccion);
  },
};
