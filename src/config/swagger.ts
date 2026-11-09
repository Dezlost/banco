/**
 * Especificación OpenAPI 3.0 escrita a mano.
 * Se sirve en /docs (Swagger UI) y en /docs.json (JSON crudo).
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Banco API',
    version: '1.0.0',
    description:
      'API REST de un sistema bancario. Permite registrar clientes, autenticarse con JWT, ' +
      'gestionar cuentas y realizar depósitos, retiros y transferencias con validaciones de negocio.',
    contact: {
      name: 'Proyecto de Programación',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual',
    },
  ],
  tags: [
    { name: 'Salud', description: 'Estado del servicio' },
    { name: 'Auth', description: 'Registro y login de clientes' },
    { name: 'Clientes', description: 'Perfil del cliente autenticado' },
    { name: 'Cuentas', description: 'Gestión de cuentas bancarias' },
    { name: 'Transacciones', description: 'Depósitos, retiros y transferencias' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en /api/auth/login o /api/auth/register',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Saldo insuficiente' },
              details: { description: 'Detalle opcional del error', nullable: true },
            },
          },
        },
      },
      Cliente: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          nombre: { type: 'string', example: 'Juan' },
          apellido: { type: 'string', example: 'Pérez' },
          dni: { type: 'string', example: '30111222' },
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CuentaResumen: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          numeroCuenta: { type: 'string', example: '4000000001' },
        },
      },
      Cuenta: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          numeroCuenta: { type: 'string', example: '4000000001' },
          tipo: { type: 'string', enum: ['AHORRO', 'CORRIENTE'] },
          saldo: { type: 'number', format: 'double', example: 45000 },
          estado: { type: 'string', enum: ['ACTIVA', 'BLOQUEADA'] },
          clienteId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Transaccion: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tipo: { type: 'string', enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'] },
          monto: { type: 'number', format: 'double', example: 5000 },
          saldoResultante: {
            type: 'number',
            format: 'double',
            description:
              'Saldo de la cuenta de origen (o destino en un depósito) luego de la operación',
            example: 45000,
          },
          descripcion: { type: 'string', nullable: true, example: 'Pago de alquiler' },
          cuentaOrigen: {
            allOf: [{ $ref: '#/components/schemas/CuentaResumen' }],
            nullable: true,
          },
          cuentaDestino: {
            allOf: [{ $ref: '#/components/schemas/CuentaResumen' }],
            nullable: true,
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          cliente: { $ref: '#/components/schemas/Cliente' },
          token: {
            type: 'string',
            description: 'JWT a enviar en el header Authorization: Bearer <token>',
          },
        },
      },
      RegistroRequest: {
        type: 'object',
        required: ['nombre', 'apellido', 'dni', 'email', 'password'],
        properties: {
          nombre: { type: 'string', minLength: 2, maxLength: 50, example: 'Juan' },
          apellido: { type: 'string', minLength: 2, maxLength: 50, example: 'Pérez' },
          dni: { type: 'string', pattern: '^\\d{7,9}$', example: '30111222' },
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'Password123!' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          password: { type: 'string', example: 'Password123!' },
        },
      },
      CrearCuentaRequest: {
        type: 'object',
        required: ['tipo'],
        properties: {
          tipo: { type: 'string', enum: ['AHORRO', 'CORRIENTE'], example: 'AHORRO' },
        },
      },
      DepositoRequest: {
        type: 'object',
        required: ['cuentaId', 'monto'],
        properties: {
          cuentaId: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          monto: { oneOf: [{ type: 'number' }, { type: 'string' }], example: 1000.5 },
          descripcion: { type: 'string', maxLength: 200, example: 'Depósito en efectivo' },
        },
      },
      RetiroRequest: {
        type: 'object',
        required: ['cuentaId', 'monto'],
        properties: {
          cuentaId: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          monto: { oneOf: [{ type: 'number' }, { type: 'string' }], example: 500 },
          descripcion: { type: 'string', maxLength: 200, example: 'Retiro por cajero' },
        },
      },
      TransferenciaRequest: {
        type: 'object',
        required: ['cuentaOrigenId', 'cuentaDestinoId', 'monto'],
        properties: {
          cuentaOrigenId: { type: 'string', example: 'clx1a2b3c4d5e6f7g8h9i0j' },
          cuentaDestinoId: { type: 'string', example: 'clx9z8y7x6w5v4u3t2s1r0q' },
          monto: { oneOf: [{ type: 'number' }, { type: 'string' }], example: 1500 },
          descripcion: { type: 'string', maxLength: 200, example: 'Pago de servicio' },
        },
      },
    },
    responses: {
      Error400: {
        description: 'Datos inválidos o regla de negocio incumplida',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      NoAutorizado: {
        description: 'Token faltante, inválido o expirado',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      Prohibido: {
        description: 'El cliente no tiene acceso al recurso',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      NoEncontrado: {
        description: 'El recurso no existe',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      Conflicto: {
        description: 'Conflicto con el estado actual del recurso',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Salud'],
        summary: 'Estado del servicio',
        description: 'Devuelve el estado de la API y de la conexión con PostgreSQL.',
        responses: {
          200: {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    database: { type: 'string', example: 'up' },
                    uptime: { type: 'number', example: 12.34 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          503: { description: 'Base de datos no disponible' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un cliente',
        description: 'Crea un cliente y devuelve sus datos junto con un JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegistroRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cliente registrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/AuthResponse' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          409: { $ref: '#/components/responses/Conflicto' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Valida email y contraseña, y devuelve un JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/AuthResponse' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
        },
      },
    },
    '/api/clientes/me': {
      get: {
        tags: ['Clientes'],
        summary: 'Perfil del cliente autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del cliente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Cliente' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/NoAutorizado' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
    },
    '/api/cuentas': {
      get: {
        tags: ['Cuentas'],
        summary: 'Listar las cuentas del cliente autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado de cuentas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Cuenta' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/NoAutorizado' },
        },
      },
      post: {
        tags: ['Cuentas'],
        summary: 'Crear una cuenta',
        description: 'Genera automáticamente el número de cuenta.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CrearCuentaRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cuenta creada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Cuenta' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
        },
      },
    },
    '/api/cuentas/{id}': {
      get: {
        tags: ['Cuentas'],
        summary: 'Obtener una cuenta por id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Detalle de la cuenta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Cuenta' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { $ref: '#/components/responses/Prohibido' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
    },
    '/api/cuentas/{id}/movimientos': {
      get: {
        tags: ['Cuentas'],
        summary: 'Listar movimientos de una cuenta',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'tipo',
            in: 'query',
            schema: { type: 'string', enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'] },
          },
          { name: 'desde', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date-time' } },
          {
            name: 'limite',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Movimientos de la cuenta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaccion' },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { $ref: '#/components/responses/Prohibido' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
    },
    '/api/transacciones': {
      get: {
        tags: ['Transacciones'],
        summary: 'Historial de transacciones del cliente',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'tipo',
            in: 'query',
            schema: { type: 'string', enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'] },
          },
          { name: 'desde', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'hasta', in: 'query', schema: { type: 'string', format: 'date-time' } },
          {
            name: 'limite',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Historial de transacciones',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaccion' },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
        },
      },
    },
    '/api/transacciones/deposito': {
      post: {
        tags: ['Transacciones'],
        summary: 'Realizar un depósito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DepositoRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Depósito realizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        cuenta: { $ref: '#/components/schemas/Cuenta' },
                        transaccion: { $ref: '#/components/schemas/Transaccion' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { $ref: '#/components/responses/Prohibido' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
    },
    '/api/transacciones/retiro': {
      post: {
        tags: ['Transacciones'],
        summary: 'Realizar un retiro',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RetiroRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Retiro realizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        cuenta: { $ref: '#/components/schemas/Cuenta' },
                        transaccion: { $ref: '#/components/schemas/Transaccion' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { $ref: '#/components/responses/Prohibido' },
          404: { $ref: '#/components/responses/NoEncontrado' },
          409: { $ref: '#/components/responses/Conflicto' },
        },
      },
    },
    '/api/transacciones/transferencia': {
      post: {
        tags: ['Transacciones'],
        summary: 'Realizar una transferencia',
        description:
          'Debita la cuenta de origen y acredita la de destino en una única transacción de base de datos.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransferenciaRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Transferencia realizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        cuentaOrigen: { $ref: '#/components/schemas/Cuenta' },
                        cuentaDestino: { $ref: '#/components/schemas/Cuenta' },
                        transaccion: { $ref: '#/components/schemas/Transaccion' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/Error400' },
          401: { $ref: '#/components/responses/NoAutorizado' },
          403: { $ref: '#/components/responses/Prohibido' },
          404: { $ref: '#/components/responses/NoEncontrado' },
          409: { $ref: '#/components/responses/Conflicto' },
        },
      },
    },
  },
};
