#!/usr/bin/env node
/**
 * Verificación end-to-end manual del sistema bancario.
 *
 * Uso:
 *   node scripts/smoke.mjs
 *   BASE_URL=http://localhost:3000 node scripts/smoke.mjs
 *
 * Crea clientes y cuentas de prueba, ejecuta depósito, retiro y transferencia,
 * y valida los casos de error principales. No reemplaza una suite de tests:
 * es una comprobación rápida para demos y para el runbook.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

let comprobaciones = 0;
let fallos = 0;

function ok(mensaje) {
  comprobaciones += 1;
  console.log(`  ✅ ${mensaje}`);
}

function fallo(mensaje, detalle) {
  comprobaciones += 1;
  fallos += 1;
  console.error(`  ❌ ${mensaje}`);
  if (detalle !== undefined) {
    console.error('     ', JSON.stringify(detalle));
  }
}

function esperar(condicion, mensaje, detalle) {
  if (condicion) {
    ok(mensaje);
  } else {
    fallo(mensaje, detalle);
  }
}

async function api(method, path, { token, body } = {}) {
  const respuesta = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const texto = await respuesta.text();
  let json = null;

  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    json = texto;
  }

  return { status: respuesta.status, body: json };
}

async function main() {
  console.log(`\n🧪 Smoke test contra ${BASE_URL}\n`);

  const sufijo = Date.now().toString().slice(-7);
  const clienteA = {
    nombre: 'Ana',
    apellido: 'Smoke',
    dni: `30${sufijo}`,
    email: `ana.${sufijo}@example.com`,
    password: 'Password123!',
  };
  const clienteB = {
    nombre: 'Bruno',
    apellido: 'Smoke',
    dni: `31${sufijo}`,
    email: `bruno.${sufijo}@example.com`,
    password: 'Password123!',
  };

  // 1. Salud
  const salud = await api('GET', '/health');
  esperar(salud.status === 200 && salud.body?.database === 'up', 'GET /health responde ok');

  // 2. Registro y login
  const registroA = await api('POST', '/api/auth/register', { body: clienteA });
  esperar(registroA.status === 201 && !!registroA.body?.data?.token, 'Registro del cliente A');
  const tokenA = registroA.body?.data?.token;

  const registroB = await api('POST', '/api/auth/register', { body: clienteB });
  esperar(registroB.status === 201 && !!registroB.body?.data?.token, 'Registro del cliente B');
  const tokenB = registroB.body?.data?.token;

  const loginA = await api('POST', '/api/auth/login', {
    body: { email: clienteA.email, password: clienteA.password },
  });
  esperar(loginA.status === 200 && !!loginA.body?.data?.token, 'Login del cliente A');

  const perfil = await api('GET', '/api/clientes/me', { token: tokenA });
  esperar(
    perfil.status === 200 && perfil.body?.data?.email === clienteA.email,
    'GET /api/clientes/me devuelve el perfil correcto',
    perfil.body,
  );

  // 3. Cuentas
  const cuentaA = await api('POST', '/api/cuentas', { token: tokenA, body: { tipo: 'AHORRO' } });
  esperar(cuentaA.status === 201 && !!cuentaA.body?.data?.numeroCuenta, 'Alta de cuenta para A');
  const cuentaAId = cuentaA.body?.data?.id;

  const cuentaB = await api('POST', '/api/cuentas', { token: tokenB, body: { tipo: 'AHORRO' } });
  esperar(cuentaB.status === 201 && !!cuentaB.body?.data?.numeroCuenta, 'Alta de cuenta para B');
  const cuentaBId = cuentaB.body?.data?.id;

  // 4. Depósito
  const deposito = await api('POST', '/api/transacciones/deposito', {
    token: tokenA,
    body: { cuentaId: cuentaAId, monto: 1000, descripcion: 'Depósito smoke' },
  });
  esperar(
    deposito.status === 201 && deposito.body?.data?.cuenta?.saldo === 1000,
    'Depósito de 1000 en la cuenta A',
    deposito.body,
  );

  // 5. Retiro
  const retiro = await api('POST', '/api/transacciones/retiro', {
    token: tokenA,
    body: { cuentaId: cuentaAId, monto: 100, descripcion: 'Retiro smoke' },
  });
  esperar(
    retiro.status === 201 && retiro.body?.data?.cuenta?.saldo === 900,
    'Retiro de 100 en la cuenta A',
    retiro.body,
  );

  // 6. Transferencia
  const transferencia = await api('POST', '/api/transacciones/transferencia', {
    token: tokenA,
    body: {
      cuentaOrigenId: cuentaAId,
      cuentaDestinoId: cuentaBId,
      monto: 200,
      descripcion: 'Transferencia smoke',
    },
  });
  esperar(
    transferencia.status === 201 &&
      transferencia.body?.data?.cuentaOrigen?.saldo === 700 &&
      transferencia.body?.data?.cuentaDestino?.saldo === 200,
    'Transferencia de 200 de A hacia B',
    transferencia.body,
  );

  // 7. Consultas
  const cuentasA = await api('GET', '/api/cuentas', { token: tokenA });
  const saldoA = cuentasA.body?.data?.find((cuenta) => cuenta.id === cuentaAId)?.saldo;
  esperar(cuentasA.status === 200 && saldoA === 700, 'Saldo final de A es 700', cuentasA.body);

  const movimientos = await api('GET', `/api/cuentas/${cuentaAId}/movimientos`, { token: tokenA });
  esperar(
    movimientos.status === 200 &&
      Array.isArray(movimientos.body?.data) &&
      movimientos.body.data.length >= 3,
    'La cuenta A registra al menos 3 movimientos',
    movimientos.body,
  );

  const historial = await api('GET', '/api/transacciones?limite=10', { token: tokenA });
  esperar(
    historial.status === 200 &&
      Array.isArray(historial.body?.data) &&
      historial.body.data.length >= 3,
    'GET /api/transacciones devuelve el historial',
    historial.body,
  );

  // 8. Concurrencia: 10 retiros simultáneos de 200 sobre un saldo de 1000.
  // Solo 5 deben tener éxito y el saldo nunca debe quedar negativo.
  const cuentaC = await api('POST', '/api/cuentas', {
    token: tokenA,
    body: { tipo: 'CORRIENTE' },
  });
  const cuentaCId = cuentaC.body?.data?.id;

  await api('POST', '/api/transacciones/deposito', {
    token: tokenA,
    body: { cuentaId: cuentaCId, monto: 1000 },
  });

  const intentos = await Promise.all(
    Array.from({ length: 10 }, () =>
      api('POST', '/api/transacciones/retiro', {
        token: tokenA,
        body: { cuentaId: cuentaCId, monto: 200 },
      }),
    ),
  );
  const exitosos = intentos.filter((intento) => intento.status === 201).length;

  const cuentasFinales = await api('GET', '/api/cuentas', { token: tokenA });
  const saldoC = cuentasFinales.body?.data?.find((cuenta) => cuenta.id === cuentaCId)?.saldo;

  esperar(exitosos === 5, 'Concurrencia: exactamente 5 de 10 retiros simultáneos tienen éxito', {
    exitosos,
    estados: intentos.map((intento) => intento.status),
  });
  esperar(saldoC === 0, 'Concurrencia: el saldo final es 0 y nunca queda negativo', saldoC);

  // 9. Casos de error
  const sinToken = await api('GET', '/api/cuentas');
  esperar(sinToken.status === 401, 'Sin token responde 401', sinToken.body);

  const cuentaAjena = await api('GET', `/api/cuentas/${cuentaBId}`, { token: tokenA });
  esperar(cuentaAjena.status === 403, 'Acceso a cuenta ajena responde 403', cuentaAjena.body);

  const saldoInsuficiente = await api('POST', '/api/transacciones/retiro', {
    token: tokenA,
    body: { cuentaId: cuentaAId, monto: 999999 },
  });
  esperar(
    saldoInsuficiente.status === 400,
    'Retiro sin saldo responde 400',
    saldoInsuficiente.body,
  );

  const transferenciaInvalida = await api('POST', '/api/transacciones/transferencia', {
    token: tokenA,
    body: { cuentaOrigenId: cuentaAId, cuentaDestinoId: cuentaAId, monto: 10 },
  });
  esperar(
    transferenciaInvalida.status === 400,
    'Transferencia a la misma cuenta responde 400',
    transferenciaInvalida.body,
  );

  const montoNegativo = await api('POST', '/api/transacciones/deposito', {
    token: tokenA,
    body: { cuentaId: cuentaAId, monto: -50 },
  });
  esperar(montoNegativo.status === 400, 'Monto negativo responde 400', montoNegativo.body);

  // 10. Documentación
  const docs = await api('GET', '/docs.json');
  esperar(
    docs.status === 200 && docs.body?.openapi === '3.0.3',
    'Swagger disponible en /docs.json',
  );

  console.log(`\n📊 ${comprobaciones - fallos}/${comprobaciones} comprobaciones exitosas\n`);

  if (fallos > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\n💥 Error inesperado en el smoke test:', error);
  process.exitCode = 1;
});
