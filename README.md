# 🏦 Banco API

API REST de un sistema bancario desarrollada con **TypeScript, Express y Prisma** sobre **PostgreSQL**. Implementa una arquitectura **MVC** con capa de servicios, autenticación **JWT**, operaciones monetarias atómicas y documentación **OpenAPI/Swagger**.

El proyecto incluye todo lo necesario para la entrega: código fuente, documentación técnica, documentación de API y un **runbook** operativo.

---

## ✨ Características

- Registro e inicio de sesión de clientes con contraseñas hasheadas (bcrypt) y JWT.
- Gestión de cuentas bancarias (`AHORRO` / `CORRIENTE`) con número generado automáticamente.
- Depósitos, retiros y transferencias con validaciones de negocio.
- **Operaciones atómicas**: los saldos no se corrompen ante requests concurrentes.
- Control de acceso: cada cliente solo opera sobre sus propias cuentas.
- Cuentas bloqueadas rechazan operaciones.
- Validación de entrada con **Zod**.
- Manejo centralizado de errores con respuestas JSON uniformes.
- Documentación interactiva en **Swagger UI** (`/docs`) y especificación OpenAPI (`/docs.json`).
- Healthcheck con verificación de base de datos (`/health`).
- Dockerfile y `docker-compose.yml` para levantar todo el stack.
- Script de verificación end-to-end (`pnpm smoke`).

## 🧰 Stack

| Área               | Tecnología                      |
| ------------------ | ------------------------------- |
| Lenguaje           | TypeScript 5 (modo estricto)    |
| Runtime            | Node.js 22 LTS                  |
| Framework HTTP     | Express 5                       |
| ORM                | Prisma 6                        |
| Base de datos      | PostgreSQL 16                   |
| Validación         | Zod 3                           |
| Autenticación      | JWT (`jsonwebtoken`) + bcryptjs |
| Documentación      | OpenAPI 3 + Swagger UI          |
| Gestor de paquetes | pnpm                            |
| Infraestructura    | Docker + Docker Compose         |

## 📁 Estructura del proyecto

```text
banco/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── migrations/            # Migraciones versionadas
│   └── seed.ts                # Datos de demostración
├── src/
│   ├── config/
│   │   ├── env.ts             # Validación de variables de entorno
│   │   └── swagger.ts         # Especificación OpenAPI
│   ├── models/                # MODEL: acceso a datos con Prisma
│   ├── controllers/           # CONTROLLER: reciben requests y responden JSON
│   ├── services/              # Lógica de negocio y transacciones atómicas
│   ├── routes/                # Definición de endpoints
│   ├── middlewares/           # Auth JWT, validación y errores
│   ├── validators/            # Esquemas Zod
│   ├── utils/                 # ApiError, JWT, serializadores, asyncHandler
│   ├── types/                 # Tipos compartidos y augmentations
│   ├── lib/prisma.ts          # Cliente Prisma singleton
│   ├── app.ts                 # Configuración de Express
│   └── server.ts              # Arranque y cierre ordenado
├── scripts/smoke.mjs          # Verificación end-to-end
├── docs/                      # Documentación técnica y runbook
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## ✅ Requisitos

- **Node.js** ≥ 20 (recomendado 22 LTS)
- **pnpm** 10+
- **PostgreSQL** 16 (local o vía Docker)
- **Docker** y **Docker Compose** (opcional, para levantar el stack completo)

## 🚀 Inicio rápido (local)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar PostgreSQL con Docker
docker compose up -d db

# 4. Aplicar migraciones y cargar datos demo
pnpm prisma:migrate
pnpm prisma:seed

# 5. Iniciar en modo desarrollo
pnpm dev
```

La API queda disponible en:

- API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/docs>
- Healthcheck: <http://localhost:3000/health>

> Si tu entorno no tiene el plugin `docker compose`, podés levantar solo PostgreSQL con:
>
> ```bash
> docker run -d --name banco-db \
>   -e POSTGRES_USER=banco -e POSTGRES_PASSWORD=banco -e POSTGRES_DB=banco \
>   -p 5432:5432 postgres:16-alpine
> ```

## 🐳 Inicio rápido (stack completo con Docker)

```bash
cp .env.example .env
docker compose up -d --build

# Cargar datos demo (una sola vez)
docker compose exec app pnpm prisma:seed
```

La API queda en <http://localhost:3000> y PostgreSQL en `localhost:5432`.

## 🔐 Variables de entorno

| Variable         | Obligatoria | Descripción                                  | Ejemplo                                                       |
| ---------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`   | Sí          | Cadena de conexión de PostgreSQL             | `postgresql://banco:banco@localhost:5432/banco?schema=public` |
| `JWT_SECRET`     | Sí          | Secreto para firmar JWT (mín. 16 caracteres) | `dev-secret-cambiar-en-produccion-2026`                       |
| `JWT_EXPIRES_IN` | No          | Vigencia del token                           | `1h`                                                          |
| `PORT`           | No          | Puerto HTTP                                  | `3000`                                                        |
| `NODE_ENV`       | No          | Entorno de ejecución                         | `development`                                                 |

## 🧪 Verificación

Con la API corriendo y la base sembrada:

```bash
pnpm smoke
```

El script recorre registro, login, alta de cuentas, depósito, retiro, transferencia, consultas y casos de error. También valida concurrencia: 10 retiros simultáneos sobre un saldo de 1000 y comprueba que el saldo nunca quede negativo.

## 📜 Scripts disponibles

| Comando               | Descripción                                |
| --------------------- | ------------------------------------------ |
| `pnpm dev`            | Servidor en modo desarrollo con recarga    |
| `pnpm build`          | Compila TypeScript a `dist/`               |
| `pnpm start`          | Ejecuta la versión compilada               |
| `pnpm prisma:migrate` | Crea y aplica migraciones en desarrollo    |
| `pnpm prisma:deploy`  | Aplica migraciones pendientes (producción) |
| `pnpm prisma:seed`    | Carga datos de demostración                |
| `pnpm prisma:studio`  | Abre Prisma Studio                         |
| `pnpm prisma:reset`   | Reinicia la base (borra datos)             |
| `pnpm smoke`          | Verificación end-to-end contra la API      |
| `pnpm lint`           | Ejecuta ESLint                             |
| `pnpm format`         | Formatea con Prettier                      |

## 👤 Credenciales demo

| Email               | Contraseña     |
| ------------------- | -------------- |
| `juan@example.com`  | `Password123!` |
| `maria@example.com` | `Password123!` |

Cuentas sembradas:

| Número       | Tipo               | Titular     | Saldo  |
| ------------ | ------------------ | ----------- | ------ |
| `4000000001` | AHORRO             | Juan Pérez  | 45.000 |
| `4000000002` | CORRIENTE          | Juan Pérez  | 10.000 |
| `4000000003` | AHORRO             | María Gómez | 30.000 |
| `4000000004` | AHORRO (BLOQUEADA) | Juan Pérez  | 0      |

## 🔌 Endpoints principales

| Método | Ruta                               | Descripción              | Auth |
| ------ | ---------------------------------- | ------------------------ | ---- |
| `POST` | `/api/auth/register`               | Registro de cliente      | No   |
| `POST` | `/api/auth/login`                  | Login y obtención de JWT | No   |
| `GET`  | `/api/clientes/me`                 | Perfil del cliente       | Sí   |
| `GET`  | `/api/cuentas`                     | Cuentas del cliente      | Sí   |
| `POST` | `/api/cuentas`                     | Crear cuenta             | Sí   |
| `GET`  | `/api/cuentas/:id`                 | Detalle de cuenta        | Sí   |
| `GET`  | `/api/cuentas/:id/movimientos`     | Movimientos de la cuenta | Sí   |
| `POST` | `/api/transacciones/deposito`      | Depósito                 | Sí   |
| `POST` | `/api/transacciones/retiro`        | Retiro                   | Sí   |
| `POST` | `/api/transacciones/transferencia` | Transferencia            | Sí   |
| `GET`  | `/api/transacciones`               | Historial del cliente    | Sí   |
| `GET`  | `/health`                          | Estado del servicio      | No   |

La referencia completa con ejemplos está en [`docs/api.md`](docs/api.md) y en Swagger UI.

## 📏 Reglas de negocio

1. El monto debe ser mayor a cero y admitir como máximo dos decimales.
2. No se puede retirar ni transferir más que el saldo disponible.
3. Las cuentas con estado `BLOQUEADA` rechazan depósitos, retiros y transferencias.
4. No se puede transferir a la misma cuenta.
5. Una transferencia debita y acredita en una única transacción de base de datos.
6. Un cliente solo puede consultar y operar sus propias cuentas.
7. El email y el DNI son únicos por cliente.
8. El número de cuenta es único y se genera automáticamente.

## 📚 Documentación

| Documento                                            | Contenido                                                 |
| ---------------------------------------------------- | --------------------------------------------------------- |
| [`docs/arquitectura.md`](docs/arquitectura.md)       | Arquitectura MVC, capas, flujos y decisiones de diseño    |
| [`docs/modelo-de-datos.md`](docs/modelo-de-datos.md) | Diagrama ER, entidades, relaciones y reglas de integridad |
| [`docs/api.md`](docs/api.md)                         | Referencia de la API con ejemplos `curl`                  |
| [`docs/runbook.md`](docs/runbook.md)                 | Operación, despliegue, backups y troubleshooting          |

## 🔒 Notas de seguridad

- Las contraseñas nunca se almacenan en texto plano (bcrypt, 10 rondas).
- El hash de contraseña nunca se devuelve en las respuestas.
- El secreto JWT se toma de variables de entorno; en producción debe ser largo y aleatorio.
- La API no registra tokens ni contraseñas en logs.
- Para producción se recomienda además rate limiting, HTTPS, rotación de secretos y un usuario de base de datos con permisos mínimos.
