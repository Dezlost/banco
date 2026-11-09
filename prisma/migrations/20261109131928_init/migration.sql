-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('AHORRO', 'CORRIENTE');

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('ACTIVA', 'BLOQUEADA');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('DEPOSITO', 'RETIRO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "id" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "saldo" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCuenta" NOT NULL DEFAULT 'ACTIVA',
    "clienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "saldoResultante" DECIMAL(14,2) NOT NULL,
    "descripcion" TEXT,
    "cuentaOrigenId" TEXT,
    "cuentaDestinoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_numeroCuenta_key" ON "cuentas"("numeroCuenta");

-- CreateIndex
CREATE INDEX "cuentas_clienteId_idx" ON "cuentas"("clienteId");

-- CreateIndex
CREATE INDEX "transacciones_cuentaOrigenId_idx" ON "transacciones"("cuentaOrigenId");

-- CreateIndex
CREATE INDEX "transacciones_cuentaDestinoId_idx" ON "transacciones"("cuentaDestinoId");

-- CreateIndex
CREATE INDEX "transacciones_createdAt_idx" ON "transacciones"("createdAt");

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_cuentaOrigenId_fkey" FOREIGN KEY ("cuentaOrigenId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
