# 📘 Runbook operativo

Guía de operación del sistema bancario: instalación, arranque, migraciones, verificación, backups, despliegue, rollback y resolución de problemas.

**Audiencia:** desarrolladores y responsables de la demo/entrega.
**Última actualización:** 2026-11-09.

---

## 1. Resumen del servicio

| Ítem                  | Valor                            |
| --------------------- | -------------------------------- |
| Servicio              | Banco API                        |
| Tipo                  | API REST HTTP                    |
| Puerto                | `3000` (configurable con `PORT`) |
| Base de datos         | PostgreSQL 16                    |
| Puerto BD             | `5432`                           |
| Healthcheck           | `GET /health`                    |
| Documentación         | `GET /docs`                      |
| Especificación        | `GET /docs.json`                 |
| Logs                  | stdout/stderr                    |
| Dependencias externas | PostgreSQL                       |

## 2. Prerrequisitos

| Herramienta    | Versión mínima           | Verificación             |
| -------------- | ------------------------ | ------------------------ |
| Node.js        | 20 (recomendado 22)      | `node -v`                |
| pnpm           | 10                       | `pnpm -v`                |
| Docker         | 24+                      | `docker --version`       |
| Docker Compose | plugin v2                | `docker compose version` |
| PostgreSQL     | 16 (si no se usa Docker) | `psql --version`         |

> Si `docker compose` no está disponible, se puede usar `docker-compose` o los comandos con `docker run` que se incluyen más abajo.

## 3. Variables de entorno

Crear `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

| Variable         | Obligatoria | Default       | Descripción                           |
| ---------------- | ----------- | ------------- | ------------------------------------- |
| `DATABASE_URL`   | Sí          | —             | Cadena de conexión PostgreSQL         |
| `JWT_SECRET`     | Sí          | —             | Secreto de firma (mín. 16 caracteres) |
| `JWT_EXPIRES_IN` | No          | `1h`          | Vigencia del token                    |
| `PORT`           | No          | `3000`        | Puerto HTTP                           |
| `NODE_ENV`       | No          | `development` | Entorno                               |

**Nunca** commitear `.env` (ya está en `.gitignore`). En producción, inyectar las variables desde el gestor de secretos del entorno.

## 4. Arranque local (desarrollo)

### 4.1 Primera vez

```bash
# 1. Dependencias
pnpm install

# 2. Configuración
cp .env.example .env

# 3. Base de datos
docker compose up -d db

# 4. Migraciones
pnpm prisma:migrate

# 5. Datos demo
pnpm prisma:seed

# 6. Servidor con recarga
pnpm dev
```

### 4.2 Sin Docker Compose disponible

```bash
docker run -d --name banco-db \
  -e POSTGRES_USER=banco \
  -e POSTGRES_PASSWORD=banco \
  -e POSTGRES_DB=banco \
  -p 5432:5432 \
  postgres:16-alpine

# Esperar a que acepte conexiones
docker exec banco-db pg_isready -U banco -d banco

# Luego continuar con migraciones y seed
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

### 4.3 Arranque diario

```bash
docker compose up -d db   # si no está corriendo
pnpm dev
```

Salida esperada:

```text
🚀 Banco API escuchando en http://localhost:3000
📘 Documentación Swagger: http://localhost:3000/docs
❤️  Healthcheck: http://localhost:3000/health
🌎 Entorno: development
```

## 5. Arranque con Docker (stack completo)

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

El contenedor `app` aplica automáticamente las migraciones pendientes (`prisma migrate deploy`) antes de iniciar.

Cargar datos demo (solo la primera vez):

```bash
docker compose exec app pnpm prisma:seed
```

Verificar:

```bash
curl -s http://localhost:3000/health
```

Detener:

```bash
docker compose down          # conserva el volumen de datos
docker compose down -v       # ⚠️ elimina la base de datos
```

## 6. Migraciones

### 6.1 Crear una migración (desarrollo)

```bash
# 1. Editar prisma/schema.prisma
# 2. Generar y aplicar
pnpm prisma:migrate --name nombre_del_cambio
# 3. Revisar el SQL generado
ls prisma/migrations/
```

### 6.2 Aplicar migraciones pendientes (producción)

```bash
pnpm prisma:deploy
```

### 6.3 Estado de migraciones

```bash
pnpm prisma migrate status
```

### 6.4 Reiniciar la base en desarrollo (destructivo)

```bash
pnpm prisma:reset   # borra todos los datos y reaplica migraciones
pnpm prisma:seed
```

> **Nunca** ejecutar `prisma migrate reset` ni `prisma migrate dev` contra producción. En producción solo se usa `migrate deploy`.

### 6.5 Deriva de migraciones (_drift_)

Si `migrate status` reporta drift:

1. No aplicar cambios manuales sobre el esquema.
2. En desarrollo: `pnpm prisma:reset`.
3. En producción: restaurar backup o crear una migración compensatoria revisada.
4. Verificar que `schema.prisma` y las migraciones estén commiteados.

## 7. Seed

Carga dos clientes, cuatro cuentas y movimientos de ejemplo. Es idempotente: no duplica datos ni transacciones.

```bash
pnpm prisma:seed
```

| Email               | Contraseña     |
| ------------------- | -------------- |
| `juan@example.com`  | `Password123!` |
| `maria@example.com` | `Password123!` |

## 8. Verificación post-arranque

### 8.1 Healthcheck

```bash
curl -s http://localhost:3000/health
```

Esperado: `{"status":"ok","database":"up",...}`. Si devuelve `503`, la base no responde (ver sección 12).

### 8.2 Smoke test

```bash
pnpm smoke
```

Debe terminar con `21/21 comprobaciones exitosas`. Contra otro host/puerto:

```bash
BASE_URL=http://localhost:3001 pnpm smoke
```

### 8.3 Swagger

Abrir <http://localhost:3000/docs> o validar el JSON:

```bash
curl -s http://localhost:3000/docs.json | head -c 200
```

## 9. Operación diaria

### 9.1 Estado

```bash
docker compose ps
curl -s http://localhost:3000/health
```

### 9.2 Logs

```bash
docker compose logs -f app     # API
docker compose logs -f db      # PostgreSQL
docker compose logs --tail=100 app
```

En local, los logs salen por la terminal donde corre `pnpm dev`.

### 9.3 Reinicio

```bash
docker compose restart app
```

### 9.4 Detener / iniciar

```bash
docker compose stop
docker compose start
```

## 10. Backup y restauración

### 10.1 Backup

```bash
mkdir -p backups
docker compose exec -T db pg_dump -U banco -d banco -Fc \
  > "backups/banco_$(date +%Y%m%d_%H%M%S).dump"
```

Verificar que el archivo no esté vacío:

```bash
ls -lh backups/
```

### 10.2 Restauración

Restaurar sobre una base nueva (recomendado):

```bash
docker compose exec db createdb -U banco banco_restore
docker compose exec -T db pg_restore -U banco -d banco_restore < backups/banco_20261109_130000.dump
```

Restaurar sobre la base actual (⚠️ sobrescribe):

```bash
docker compose exec -T db pg_restore -U banco -d banco --clean --if-exists \
  < backups/banco_20261109_130000.dump
```

### 10.3 Frecuencia sugerida

| Entorno                | Frecuencia   | Retención |
| ---------------------- | ------------ | --------- |
| Desarrollo             | Bajo demanda | 7 días    |
| Producción             | Diaria       | 30 días   |
| Antes de un despliegue | Obligatorio  | 30 días   |

## 11. Despliegue y rollback

### 11.1 Despliegue con Docker

```bash
git pull
docker compose build app
docker compose up -d app
docker compose logs -f app
curl -s http://localhost:3000/health
```

El arranque ejecuta `prisma migrate deploy` automáticamente.

### 11.2 Despliegue sin Docker

```bash
git pull
pnpm install --frozen-lockfile
pnpm prisma:deploy
pnpm build
# reiniciar el proceso (systemd, pm2, etc.)
pnpm start
```

### 11.3 Rollback de aplicación

1. Identificar la imagen/commit anterior.
2. Volver a desplegar esa versión:

```bash
git checkout <commit_anterior>
docker compose build app
docker compose up -d app
```

### 11.4 Rollback de base de datos

Las migraciones de Prisma son **solo hacia adelante**; no hay rollback automático.

- Si la migración es compatible: desplegar la versión anterior de la app sin tocar la base.
- Si rompió datos: restaurar el backup previo al despliegue (sección 10.2).
- Si es necesario revertir el esquema: crear una **nueva migración compensatoria** revisada, nunca editar la migración aplicada.

## 12. Troubleshooting

| Síntoma                                            | Causa probable                             | Solución                                                                                 |
| -------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:5432` / `P1001`            | PostgreSQL no está corriendo               | `docker compose up -d db` y esperar `pg_isready`                                         |
| `P1000: Authentication failed`                     | Credenciales incorrectas en `DATABASE_URL` | Revisar usuario/password/base                                                            |
| `Environment variable not found: DATABASE_URL`     | Falta `.env` o no se cargó                 | `cp .env.example .env` desde la raíz                                                     |
| `JWT_SECRET debe tener al menos 16 caracteres`     | Secreto corto                              | Usar uno más largo                                                                       |
| `Port 3000 already in use`                         | Otro proceso ocupa el puerto               | `PORT=3001 pnpm dev` o liberar el puerto                                                 |
| `401 Token inválido o expirado`                    | Token vencido o secreto distinto           | Volver a loguearse                                                                       |
| `403 No tenés acceso a esta cuenta`                | La cuenta es de otro cliente               | Usar una cuenta propia                                                                   |
| `400 Saldo insuficiente`                           | Regla de negocio                           | Operar por un monto menor                                                                |
| `400 La cuenta ... está bloqueada`                 | Cuenta en estado `BLOQUEADA`               | Usar una cuenta activa                                                                   |
| `409 Ya existe un registro con esos datos`         | Email o DNI duplicado                      | Usar otro email/DNI                                                                      |
| `/health` devuelve `503`                           | Base caída o inaccesible                   | Revisar logs de `db` y `DATABASE_URL`                                                    |
| Swagger no carga o queda en blanco                 | Recursos bloqueados o JS deshabilitado     | Verificar `/docs.json`; la CSP de helmet está desactivada para `/docs`                   |
| `Ignored build scripts: prisma` al instalar        | pnpm 10 bloquea postinstall                | Ya configurado en `package.json` → `pnpm.onlyBuiltDependencies`; ejecutar `pnpm install` |
| `Can't reach database server at db:5432` en Docker | `app` arrancó antes que la BD              | `docker compose restart app` (hay `depends_on` con healthcheck)                          |
| Migración falla por drift                          | Esquema modificado a mano                  | `pnpm prisma:reset` en dev; en prod, migración compensatoria                             |

### 12.1 Comandos de diagnóstico rápido

```bash
# ¿La API está viva?
curl -s http://localhost:3000/health

# ¿La base está viva?
docker compose exec db pg_isready -U banco -d banco

# ¿Hay migraciones pendientes?
pnpm prisma migrate status

# ¿Qué contenedores están corriendo?
docker compose ps

# Últimos logs
docker compose logs --tail=100 app
```

## 13. Seguridad operativa

- Rotar `JWT_SECRET` invalida todos los tokens emitidos (los clientes deben reloguearse).
- Usar contraseñas de base de datos fuertes en producción; no reutilizar las de desarrollo.
- No exponer PostgreSQL fuera de la red interna en producción (quitar el mapeo `5432:5432`).
- Servir la API detrás de HTTPS (reverse proxy: Nginx, Caddy, Traefik).
- Restringir CORS a los orígenes del frontend en producción.
- Almacenar los backups cifrados y fuera del servidor.
- Revisar logs de errores `500`; no incluyen datos sensibles, pero pueden indicar fallas.

## 14. Checklist de entrega / demo

- [ ] `pnpm install` sin errores.
- [ ] `.env` configurado.
- [ ] `docker compose up -d db` y `pnpm prisma:migrate` aplicados.
- [ ] `pnpm prisma:seed` ejecutado.
- [ ] `pnpm dev` arranca sin errores.
- [ ] `GET /health` responde `ok`.
- [ ] Swagger disponible en `/docs`.
- [ ] `pnpm smoke` termina `21/21`.
- [ ] Documentos `arquitectura.md`, `modelo-de-datos.md`, `api.md` y este runbook están actualizados.
- [ ] `.env` **no** está commiteado.

## 15. Contacto

| Rol         | Responsable                       |
| ----------- | --------------------------------- |
| Desarrollo  | Alumno/a                          |
| Cátedra     | Docente de Programación           |
| Repositorio | _(completar con la URL del repo)_ |
