# 📡 Referencia de la API

API REST del sistema bancario. Todas las respuestas son `application/json`.

- **URL base local:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/docs`
- **Especificación OpenAPI:** `http://localhost:3000/docs.json`

---

## 1. Autenticación

Los endpoints protegidos requieren un JWT en el header:

```http
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/auth/register` o `POST /api/auth/login`.

Con `jq` instalado, se puede guardar en una variable:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"Password123!"}' \
  | jq -r '.data.token')
```

## 2. Formato de respuestas

**Éxito**

```json
{ "data": {} }
```

En listados, `data` es un arreglo.

**Error**

```json
{
  "error": {
    "message": "Descripción legible del error",
    "details": null
  }
}
```

En errores de validación, `details` contiene el detalle por campo generado por Zod.

## 3. Códigos de estado

| Código | Significado                                                   |
| ------ | ------------------------------------------------------------- |
| `200`  | Consulta exitosa                                              |
| `201`  | Recurso creado u operación realizada                          |
| `400`  | Datos inválidos o regla de negocio incumplida                 |
| `401`  | Token faltante, inválido o expirado; credenciales incorrectas |
| `403`  | El cliente no tiene acceso al recurso                         |
| `404`  | Recurso inexistente                                           |
| `409`  | Conflicto (email/DNI duplicado, operación concurrente)        |
| `500`  | Error interno                                                 |
| `503`  | Base de datos no disponible (`/health`)                       |

---

## 4. Salud

### `GET /health`

Verifica que la API esté viva y que PostgreSQL responda.

```bash
curl -s http://localhost:3000/health
```

```json
{
  "status": "ok",
  "database": "up",
  "uptime": 12.34,
  "timestamp": "2026-11-09T13:19:36.371Z"
}
```

Si la base no responde: `503` con `{ "status": "error", "database": "down" }`.

---

## 5. Autenticación

### `POST /api/auth/register`

Registra un cliente y devuelve sus datos junto con un JWT.

**Body**

| Campo      | Tipo   | Obligatorio | Reglas              |
| ---------- | ------ | ----------- | ------------------- |
| `nombre`   | string | Sí          | 2–50 caracteres     |
| `apellido` | string | Sí          | 2–50 caracteres     |
| `dni`      | string | Sí          | 7–9 dígitos         |
| `email`    | string | Sí          | email válido, único |
| `password` | string | Sí          | 8–72 caracteres     |

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "García",
    "dni": "32123456",
    "email": "ana@example.com",
    "password": "Password123!"
  }'
```

**201 Created**

```json
{
  "data": {
    "cliente": {
      "id": "clx1a2b3c4d5e6f7g8h9i0j",
      "nombre": "Ana",
      "apellido": "García",
      "dni": "32123456",
      "email": "ana@example.com",
      "createdAt": "2026-11-09T13:00:00.000Z",
      "updatedAt": "2026-11-09T13:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Errores posibles: `400` (validación), `409` (email o DNI duplicado).

### `POST /api/auth/login`

**Body**

| Campo      | Tipo   | Obligatorio |
| ---------- | ------ | ----------- |
| `email`    | string | Sí          |
| `password` | string | Sí          |

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"Password123!"}'
```

**200 OK** — misma estructura que el registro. Credenciales inválidas: `401`.

---

## 6. Clientes

### `GET /api/clientes/me`

Devuelve el perfil del cliente autenticado. Nunca incluye `passwordHash`.

```bash
curl -s http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "30111222",
    "email": "juan@example.com",
    "createdAt": "2026-11-09T13:00:00.000Z",
    "updatedAt": "2026-11-09T13:00:00.000Z"
  }
}
```

---

## 7. Cuentas

### `GET /api/cuentas`

Lista las cuentas del cliente autenticado.

```bash
curl -s http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j",
      "numeroCuenta": "4000000001",
      "tipo": "AHORRO",
      "saldo": 45000,
      "estado": "ACTIVA",
      "clienteId": "clx1a2b3c4d5e6f7g8h9i0j",
      "createdAt": "2026-11-09T13:00:00.000Z",
      "updatedAt": "2026-11-09T13:00:00.000Z"
    }
  ]
}
```

### `POST /api/cuentas`

Crea una cuenta. El `numeroCuenta` se genera automáticamente.

**Body**

| Campo  | Tipo   | Obligatorio | Valores                |
| ------ | ------ | ----------- | ---------------------- |
| `tipo` | string | Sí          | `AHORRO` o `CORRIENTE` |

```bash
curl -s -X POST http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"AHORRO"}'
```

**201 Created**

```json
{
  "data": {
    "id": "clx9z8y7x6w5v4u3t2s1r0q",
    "numeroCuenta": "4821390577",
    "tipo": "AHORRO",
    "saldo": 0,
    "estado": "ACTIVA",
    "clienteId": "clx1a2b3c4d5e6f7g8h9i0j",
    "createdAt": "2026-11-09T13:10:00.000Z",
    "updatedAt": "2026-11-09T13:10:00.000Z"
  }
}
```

### `GET /api/cuentas/:id`

Detalle de una cuenta propia. `403` si la cuenta pertenece a otro cliente, `404` si no existe.

```bash
curl -s http://localhost:3000/api/cuentas/clx1a2b3c4d5e6f7g8h9i0j \
  -H "Authorization: Bearer $TOKEN"
```

### `GET /api/cuentas/:id/movimientos`

Movimientos de una cuenta propia. Admite filtros (ver sección 9).

```bash
curl -s "http://localhost:3000/api/cuentas/clx1a2b3c4d5e6f7g8h9i0j/movimientos?limite=20" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "data": [
    {
      "id": "clxmov1...",
      "tipo": "TRANSFERENCIA",
      "monto": 5000,
      "saldoResultante": 45000,
      "descripcion": "Transferencia de ejemplo entre clientes",
      "cuentaOrigen": { "id": "clx1...", "numeroCuenta": "4000000001" },
      "cuentaDestino": { "id": "clx2...", "numeroCuenta": "4000000003" },
      "createdAt": "2026-11-09T13:05:00.000Z"
    }
  ]
}
```

---

## 8. Transacciones

### `POST /api/transacciones/deposito`

Acredita dinero en una cuenta propia.

**Body**

| Campo         | Tipo             | Obligatorio | Reglas                 |
| ------------- | ---------------- | ----------- | ---------------------- |
| `cuentaId`    | string           | Sí          | cuenta propia y activa |
| `monto`       | number \| string | Sí          | > 0, máx. 2 decimales  |
| `descripcion` | string           | No          | máx. 200 caracteres    |

```bash
curl -s -X POST http://localhost:3000/api/transacciones/deposito \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cuentaId":"clx1a2b3c4d5e6f7g8h9i0j","monto":1500.50,"descripcion":"Depósito"}'
```

**201 Created**

```json
{
  "data": {
    "cuenta": {
      "id": "clx1a2b3c4d5e6f7g8h9i0j",
      "numeroCuenta": "4000000001",
      "tipo": "AHORRO",
      "saldo": 46500.5,
      "estado": "ACTIVA",
      "clienteId": "clx1a2b3c4d5e6f7g8h9i0j",
      "createdAt": "2026-11-09T13:00:00.000Z",
      "updatedAt": "2026-11-09T13:15:00.000Z"
    },
    "transaccion": {
      "id": "clxtx1...",
      "tipo": "DEPOSITO",
      "monto": 1500.5,
      "saldoResultante": 46500.5,
      "descripcion": "Depósito",
      "cuentaOrigen": null,
      "cuentaDestino": { "id": "clx1a2b3c4d5e6f7g8h9i0j", "numeroCuenta": "4000000001" },
      "createdAt": "2026-11-09T13:15:00.000Z"
    }
  }
}
```

### `POST /api/transacciones/retiro`

Debita dinero de una cuenta propia.

```bash
curl -s -X POST http://localhost:3000/api/transacciones/retiro \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cuentaId":"clx1a2b3c4d5e6f7g8h9i0j","monto":500,"descripcion":"Retiro"}'
```

**201 Created** — misma estructura que el depósito (`cuenta` + `transaccion`).

Errores: `400` saldo insuficiente o cuenta bloqueada; `403` cuenta ajena; `404` inexistente; `409` conflicto concurrente.

### `POST /api/transacciones/transferencia`

Debita la cuenta de origen y acredita la de destino en una única transacción de base de datos.

**Body**

| Campo             | Tipo             | Obligatorio | Reglas                      |
| ----------------- | ---------------- | ----------- | --------------------------- |
| `cuentaOrigenId`  | string           | Sí          | cuenta propia y activa      |
| `cuentaDestinoId` | string           | Sí          | distinta del origen, activa |
| `monto`           | number \| string | Sí          | > 0, máx. 2 decimales       |
| `descripcion`     | string           | No          | máx. 200 caracteres         |

```bash
curl -s -X POST http://localhost:3000/api/transacciones/transferencia \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cuentaOrigenId": "clx1a2b3c4d5e6f7g8h9i0j",
    "cuentaDestinoId": "clx9z8y7x6w5v4u3t2s1r0q",
    "monto": 2000,
    "descripcion": "Alquiler"
  }'
```

**201 Created**

```json
{
  "data": {
    "cuentaOrigen": { "...": "saldo actualizado" },
    "cuentaDestino": { "...": "saldo actualizado" },
    "transaccion": { "...": "movimiento registrado" }
  }
}
```

Errores: `400` saldo insuficiente, misma cuenta o cuenta bloqueada; `403` cuenta de origen ajena; `404` cuenta inexistente.

### `GET /api/transacciones`

Historial de transacciones del cliente autenticado (como origen o destino), ordenado de más reciente a más antiguo.

```bash
curl -s "http://localhost:3000/api/transacciones?tipo=TRANSFERENCIA&limite=25" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9. Filtros de listados

Aplican a `GET /api/transacciones` y `GET /api/cuentas/:id/movimientos`.

| Parámetro | Tipo     | Valores                               | Default    |
| --------- | -------- | ------------------------------------- | ---------- |
| `tipo`    | string   | `DEPOSITO`, `RETIRO`, `TRANSFERENCIA` | todos      |
| `desde`   | ISO 8601 | fecha/hora mínima                     | sin límite |
| `hasta`   | ISO 8601 | fecha/hora máxima                     | sin límite |
| `limite`  | integer  | 1–100                                 | 50         |

Ejemplo:

```bash
curl -s "http://localhost:3000/api/transacciones?desde=2026-11-01T00:00:00Z&hasta=2026-11-30T23:59:59Z&limite=100" \
  -H "Authorization: Bearer $TOKEN"
```

Si `desde` es posterior a `hasta`, la API responde `400`.

---

## 10. Ejemplo de flujo completo

```bash
BASE=http://localhost:3000

# 1. Registro
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","apellido":"García","dni":"32123456","email":"ana@example.com","password":"Password123!"}'

# 2. Login
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"Password123!"}' \
  | jq -r '.data.token')

# 3. Crear cuenta
CUENTA=$(curl -s -X POST $BASE/api/cuentas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"AHORRO"}' | jq -r '.data.id')

# 4. Depositar
curl -s -X POST $BASE/api/transacciones/deposito \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"cuentaId\":\"$CUENTA\",\"monto\":1000}"

# 5. Consultar saldo
curl -s $BASE/api/cuentas/$CUENTA -H "Authorization: Bearer $TOKEN"
```

---

## 11. Documentación interactiva

Swagger UI en `http://localhost:3000/docs` permite:

- Ver todos los endpoints y sus esquemas.
- Usar **Authorize** para pegar el JWT y probar endpoints protegidos.
- Descargar la especificación desde `/docs.json`.
