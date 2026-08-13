# Backend MundoPórix

Monolito modular con **NestJS 11** + **PostgreSQL** + **Prisma 7** que controla la cadena de negocio:

**Producto → Stock → Cotización → Reserva → Preparación → Recogida**

## Características

- Autenticación JWT con refresh token (rotación + hash), roles `ADMIN`/`SELLER`.
- Cotizaciones con **máquina de estados** (`NEW → RESERVED → PREPARING → READY_FOR_PICKUP → PICKED_UP`) y estados `CANCELLED`/`EXPIRED`.
- **Control de precio**: el cliente nunca fija precios; se congela el precio oficial de la BD en el momento de cotizar.
- **Reserva atómica de stock**: UPDATE condicional vía `$executeRaw` dentro de transacción (sin oversell bajo concurrencia).
- Números de cotización `COT-AAAA-NNNNNN` generados con secuencia Postgres (`nextval`, atómico y sin colisiones).
- Expiración automática de reservas (cron horario) con liberación de stock.
- Swagger en `/api/docs`, prefijo de API `api/v1`, rate limiting, helmet, validación estricta de DTOs.
- Auditoría de acciones (tabla `audit_logs`).

## Requisitos

- Node.js 20+ y npm
- Docker (para PostgreSQL) o un PostgreSQL 16 local

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Configurar variables (o usar el .env por defecto)
cp .env.example .env

# 4. Ejecutar migraciones y sembrar la BD
npx prisma migrate deploy
npx prisma db seed

# 5. Arrancar en desarrollo
npm run start:dev
```

La API queda en `http://localhost:3000/api/v1` y la documentación en `http://localhost:3000/api/docs`.

> Los puertos 3000/3001 del proyecto frontend ya pueden estar ocupados; si es tu caso, define `PORT` (p. ej. `PORT=3050 npm run start:dev`).

## Usuario semilla

| Email                  | Password   | Rol   |
| ---------------------- | ---------- | ----- |
| `admin@mundoporix.com` | `Admin123!`| ADMIN |

## Estructura de módulos

```
src/
├── auth/            # login, refresh, logout, me + estrategia JWT
├── users/           # gestión de usuarios (admin)
├── products/        # productos con categoría, marca, temporadas e inventario
├── categories/      # categorías CRUD
├── brands/          # marcas CRUD
├── seasons/         # temporadas y asociación producto-temporada
├── inventory/       # stock, reserva/liberación atómica
├── quotes/          # cotizaciones, máquina de estados, calculadora, números
├── reservations/    # expiración automática de reservas
├── pickup/          # flujo de preparación y recogida
├── notifications/   # stubs de Email/WhatsApp
├── audit/           # auditoría de acciones
├── health/          # healthcheck (estado de la BD)
├── common/          # guards, decoradores, filtros y utilidades
├── prisma/          # PrismaService + cliente generado
└── config/          # configuración validada con Joi
```

## Endpoints principales (prefijo `api/v1`)

### Públicos
| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Cerrar sesión (invalida refresh) |
| `GET`  | `/auth/me` | Datos del usuario autenticado |
| `GET`  | `/products` | Listar productos activos |
| `GET`  | `/products/:id` | Detalle de producto |
| `GET`  | `/categories` / `/brands` / `/seasons` | Catálogos públicos |
| `POST` | `/quotes` | Crear cotización (reserva stock) |
| `GET`  | `/quotes/:quoteNumber` | Consultar cotización por número |
| `GET`  | `/health` | Healthcheck |

### Administrativos (requieren `Authorization: Bearer <token>`, ADMIN/SELLER según ruta)
| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `POST` | `/admin/products` | Crear producto con stock inicial |
| `GET`  | `/admin/products` | Listar todos los productos |
| `PATCH`/`DELETE` | `/admin/products/:id` | Actualizar / desactivar producto |
| `POST` | `/admin/categories` | Crear categoría |
| `GET`  | `/admin/inventory` | Inventario general |
| `GET`  | `/admin/inventory/:productId` | Stock de un producto |
| `PATCH`| `/admin/inventory/:productId` | Ajustar stock |
| `POST` | `/admin/quotes` | Listar cotizaciones |
| `GET`  | `/admin/quotes/:id` | Detalle de cotización |
| `PATCH`| `/admin/quotes/:id/status` | Transición de estado (validada) |
| `POST` | `/admin/quotes/:id/cancel` | Cancelar y liberar stock |
| `GET`  | `/admin/pickup/pending` | Recogidas pendientes |
| `PATCH`| `/admin/pickup/:quoteId/prepare\|ready\|complete` | Avanzar preparación/recogida |
| `POST` | `/admin/users` | Crear usuario (ADMIN) |
| `GET`  | `/admin/audit-logs` | Registro de auditoría |

## Pruebas

```bash
# Unitarias (15)
npm run test

# E2E (8): usa la BD mundoporix_test (requiere Postgres arriba y migraciones aplicadas)
npx prisma migrate deploy   # con DATABASE_URL apuntando a mundoporix_test
npm run test:e2e
```

## Scripts útiles

| Comando | Descripción |
| ------- | ----------- |
| `npm run start:dev` | Desarrollo con watch |
| `npm run build` | Compilar a `dist/` |
| `npm run start:prod` | Ejecutar compilado (`node dist/src/main`) |
| `npm run lint` | ESLint + Prettier |
| `npm run format` | Formatear código |

## Variables de entorno (`.env`)

| Variable | Descripción | Default |
| -------- | ----------- | ------- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://mundoporix:...@localhost:5432/mundoporix` |
| `PORT` | Puerto HTTP | `3000` |
| `API_PREFIX` | Prefijo de la API | `api/v1` |
| `CORS_ORIGIN` | Orígenes permitidos (coma-separados) | `http://localhost:3001` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secretos JWT | `super-secret-...-change-me` |
| `JWT_ACCESS_EXPIRES_IN` | Expiración access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración refresh token | `7d` |
| `THROTTLE_TTL_SECONDS` / `THROTTLE_LIMIT` | Rate limiting | `60` / `100` |
| `RESERVATION_EXPIRATION_HOURS` | Duración de reservas | `24` |
| `NOTIFICATIONS_ENABLED` | Habilitar notificaciones (stubs) | `false` |
