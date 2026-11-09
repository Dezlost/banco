import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload extends jwt.JwtPayload {
  sub: string;
}

/** Firma un JWT con el id del cliente como sujeto. */
export function firmarToken(clienteId: string): string {
  return jwt.sign({ sub: clienteId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/** Verifica un JWT y devuelve su payload. Lanza error si es inválido o expiró. */
export function verificarToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === 'string' || !payload.sub) {
    throw new Error('Token inválido');
  }

  return payload as TokenPayload;
}
