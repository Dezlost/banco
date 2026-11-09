import bcrypt from 'bcryptjs';
import { clienteModel } from '../models/cliente.model';
import { ApiError } from '../utils/ApiError';
import { firmarToken } from '../utils/jwt';
import { serializarCliente } from '../utils/serializers';
import { LoginInput, RegistroInput } from '../validators/auth.validator';

const RONDAS_BCRYPT = 10;

export const authService = {
  /** Registra un cliente nuevo y devuelve sus datos junto con un JWT. */
  async registrar(data: RegistroInput) {
    const emailExistente = await clienteModel.buscarPorEmail(data.email);
    if (emailExistente) {
      throw new ApiError(409, 'Ya existe un cliente con ese email');
    }

    const dniExistente = await clienteModel.buscarPorDni(data.dni);
    if (dniExistente) {
      throw new ApiError(409, 'Ya existe un cliente con ese DNI');
    }

    const passwordHash = await bcrypt.hash(data.password, RONDAS_BCRYPT);
    const cliente = await clienteModel.crear({
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      email: data.email,
      passwordHash,
    });

    return {
      cliente: serializarCliente(cliente),
      token: firmarToken(cliente.id),
    };
  },

  /** Valida credenciales y devuelve el cliente con un JWT. */
  async login(data: LoginInput) {
    const cliente = await clienteModel.buscarPorEmail(data.email);

    if (!cliente) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(data.password, cliente.passwordHash);
    if (!passwordValida) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    return {
      cliente: serializarCliente(cliente),
      token: firmarToken(cliente.id),
    };
  },
};
