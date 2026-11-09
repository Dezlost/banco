import { EstadoCuenta, Prisma, PrismaClient, TipoCuenta } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD_DEMO = 'Password123!';

async function upsertCuenta(
  numeroCuenta: string,
  tipo: TipoCuenta,
  clienteId: string,
  estado: EstadoCuenta = EstadoCuenta.ACTIVA,
) {
  return prisma.cuenta.upsert({
    where: { numeroCuenta },
    update: {},
    create: {
      numeroCuenta,
      tipo,
      clienteId,
      estado,
      saldo: new Prisma.Decimal(0),
    },
  });
}

async function depositar(cuentaId: string, montoStr: string, descripcion: string) {
  const monto = new Prisma.Decimal(montoStr);
  await prisma.$transaction(async (tx) => {
    const cuenta = await tx.cuenta.update({
      where: { id: cuentaId },
      data: { saldo: { increment: monto } },
    });
    await tx.transaccion.create({
      data: {
        tipo: 'DEPOSITO',
        monto,
        saldoResultante: cuenta.saldo,
        descripcion,
        cuentaDestinoId: cuentaId,
      },
    });
  });
}

async function transferir(
  cuentaOrigenId: string,
  cuentaDestinoId: string,
  montoStr: string,
  descripcion: string,
) {
  const monto = new Prisma.Decimal(montoStr);
  await prisma.$transaction(async (tx) => {
    const origen = await tx.cuenta.update({
      where: { id: cuentaOrigenId },
      data: { saldo: { decrement: monto } },
    });
    await tx.cuenta.update({
      where: { id: cuentaDestinoId },
      data: { saldo: { increment: monto } },
    });
    await tx.transaccion.create({
      data: {
        tipo: 'TRANSFERENCIA',
        monto,
        saldoResultante: origen.saldo,
        descripcion,
        cuentaOrigenId,
        cuentaDestinoId,
      },
    });
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);

  const juan = await prisma.cliente.upsert({
    where: { email: 'juan@example.com' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30111222',
      email: 'juan@example.com',
      passwordHash,
    },
  });

  const maria = await prisma.cliente.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      nombre: 'María',
      apellido: 'Gómez',
      dni: '27888999',
      email: 'maria@example.com',
      passwordHash,
    },
  });

  const ahorroJuan = await upsertCuenta('4000000001', TipoCuenta.AHORRO, juan.id);
  const corrienteJuan = await upsertCuenta('4000000002', TipoCuenta.CORRIENTE, juan.id);
  const ahorroMaria = await upsertCuenta('4000000003', TipoCuenta.AHORRO, maria.id);
  const bloqueadaJuan = await upsertCuenta(
    '4000000004',
    TipoCuenta.AHORRO,
    juan.id,
    EstadoCuenta.BLOQUEADA,
  );

  const transaccionesExistentes = await prisma.transaccion.count();
  if (transaccionesExistentes === 0) {
    await depositar(ahorroJuan.id, '50000.00', 'Depósito inicial de ejemplo');
    await depositar(corrienteJuan.id, '10000.00', 'Depósito inicial de ejemplo');
    await depositar(ahorroMaria.id, '25000.00', 'Depósito inicial de ejemplo');
    await transferir(
      ahorroJuan.id,
      ahorroMaria.id,
      '5000.00',
      'Transferencia de ejemplo entre clientes',
    );
  }

  console.log('✅ Seed completado');
  console.log('   Clientes demo:');
  console.log(`   - juan@example.com  / ${PASSWORD_DEMO}`);
  console.log(`   - maria@example.com / ${PASSWORD_DEMO}`);
  console.log('   Cuentas:');
  console.log(`   - ${ahorroJuan.numeroCuenta} (AHORRO, Juan)`);
  console.log(`   - ${corrienteJuan.numeroCuenta} (CORRIENTE, Juan)`);
  console.log(`   - ${ahorroMaria.numeroCuenta} (AHORRO, María)`);
  console.log(`   - ${bloqueadaJuan.numeroCuenta} (AHORRO BLOQUEADA, Juan)`);
}

main()
  .catch((error) => {
    console.error('❌ Error ejecutando el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
