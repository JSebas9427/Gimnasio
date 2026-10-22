# GymSystem — Sistema de gestión de gimnasio

Aplicación web para administrar un gimnasio: clientes, empleados (vendedores), planes,
facturación (mensualidades y entrenos diarios), métodos de pago, control de acceso con
torniquete Dahua, cumpleaños y reportes de ingresos.

| Parte     | Tecnología                                          | Carpeta         |
|-----------|-----------------------------------------------------|-----------------|
| Backend   | Java 21 · Spring Boot 3.3 · Spring Data JPA · MySQL | `gym-backend/`  |
| Frontend  | Angular 17 · Angular Material                       | `gym-frontend/` |
| Servidor  | XAMPP (Apache sirve el frontend, MySQL/MariaDB)     | —               |

La referencia completa de endpoints está en [docs/API.md](docs/API.md).

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Puesta en marcha (desarrollo)](#puesta-en-marcha-desarrollo)
3. [Despliegue en XAMPP](#despliegue-en-xampp)
4. [Funcionalidades](#funcionalidades)
5. [Búsquedas](#búsquedas)
6. [Reglas de negocio](#reglas-de-negocio)
7. [Modelo de datos](#modelo-de-datos)
8. [Estructura del código](#estructura-del-código)
9. [Configuración](#configuración)
10. [Solución de problemas](#solución-de-problemas)

---

## Arquitectura

```
Navegador ──► Apache (XAMPP) :80 ── /gym/ ──► Angular (archivos estáticos)
    │
    └──── HTTP/JSON ────► Spring Boot :8080 ── /api/v1/... ──► MySQL :3306 (gym_db)
                                   │
                                   └──► Torniquete Dahua (HTTP Digest)
```

- El frontend es una SPA servida por Apache bajo `/gym/`. Un `.htaccess` redirige
  cualquier ruta (`/gym/clientes/123`, `/gym/facturas/45`…) a `index.html`, lo que
  permite abrir perfiles y facturas en pestañas nuevas.
- El backend expone una API REST en `http://<servidor>:8080/api/v1`.
  `server.servlet.context-path=/api` aporta el prefijo `/api`; por eso los
  controladores usan `@RequestMapping("/v1/...")` (**no** `/api/v1/...`).
- Hibernate (`ddl-auto=update`) crea y actualiza las tablas automáticamente al arrancar.

---

## Puesta en marcha (desarrollo)

Requisitos: **Java 21**, **Node 18+**, **MySQL/MariaDB** (el de XAMPP sirve).

### 1. Base de datos

Inicia MySQL desde el panel de XAMPP. La base `gym_db` debe existir:

```sql
CREATE DATABASE IF NOT EXISTS gym_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`gym-backend/src/main/resources/schema.sql` contiene el esquema de referencia y datos de
prueba, pero no es obligatorio: Hibernate crea las tablas solo.

### 2. Backend

```bash
cd gym-backend
./mvnw spring-boot:run
```

Queda en `http://localhost:8080/api/v1`. Al arrancar por primera vez crea los métodos de
pago EFECTIVO, TARJETA, TRANSFERENCIA y NEQUI.

### 3. Frontend

```bash
cd gym-frontend
npm install
npx ng serve
```

Abre `http://localhost:4200`. En desarrollo usa `src/environments/environment.ts`
(API en `http://localhost:8080/api/v1`).

---

## Despliegue en XAMPP

1. **Backend** — generar y ejecutar el `.jar`:

   ```bash
   cd gym-backend
   ./mvnw package -DskipTests
   java -jar target/gym-backend-0.0.1-SNAPSHOT.jar
   ```

2. **Frontend** — compilar en modo producción:

   ```bash
   cd gym-frontend
   npx ng build
   ```

   La configuración de producción ya aplica `baseHref: "/gym/"` y usa
   `environment.prod.ts`. Copia **todo** el contenido de `dist/gym-frontend/browser/`
   (incluido el archivo oculto `.htaccess`) a `C:\xampp\htdocs\gym\`.

3. Abre `http://localhost/gym/` (o `http://<IP-del-servidor>/gym/` desde otro equipo).

Requisitos de Apache (vienen así por defecto en XAMPP): `mod_rewrite` habilitado y
`AllowOverride All` en `htdocs`.

En producción el frontend llama al backend en **el mismo equipo desde el que se abrió la
app**, puerto 8080 (`${location.hostname}:8080`). Así funciona tanto en el servidor
(`localhost`) como desde otros PCs de la red. CORS acepta `localhost`, `127.0.0.1`,
`192.168.*.*` y `10.*.*.*`.

---

## Funcionalidades

| Módulo | Ruta | Qué hace |
|---|---|---|
| Dashboard | `/dashboard` | Ingresos del día/semana, clientes activos, vencimientos próximos, estado de membresías, cumpleaños del mes, **panel de ingreso** por cédula con apertura del torniquete y tabla de accesos del día (clic en CC o nombre → perfil). |
| Reportes | `/reportes` | Ingresos por período, por tipo y por método de pago; gráfica por día; clientes nuevos; accesos. |
| Planes | `/planes` | CRUD de planes (nombre, precio, duración en días). |
| Clientes | `/clientes` | Lista con estado de membresía, búsqueda, registro simple o **registro completo** (cliente + primera mensualidad), desactivar/reactivar. |
| Perfil de cliente | `/clientes/:cc` | Datos, estado de la membresía, historial de facturas con **ver/editar factura**, nueva factura. |
| Empleados | `/vendedores` | CRUD de empleados/vendedores con búsqueda. |
| Perfil de empleado | `/vendedores/:cc` | Totales vendidos por período (hoy, semana, mes, año) y sus facturas con **ver/editar**. |
| Facturas | `/facturas` | Lista con búsqueda y filtro por mes/año, crear y editar. |
| Factura detallada | `/facturas/:id` | Comprobante imprimible. **Se abre en una pestaña nueva al registrar una factura.** |
| Métodos de pago | `/metodos-pago` | CRUD de métodos de pago, con activar/desactivar. |

Comportamientos de la interfaz:

- **Todo enlace a un perfil (cliente o empleado) abre una pestaña nueva**, desde listas,
  facturas, dashboard, reportes y perfiles. Lo centraliza `NavegacionService`
  (`core/services/navegacion.service.ts`), que respeta el `base href`.
- Al registrar una factura, la pestaña se reserva en el momento del clic y luego se
  dirige a la factura creada; así el navegador no la bloquea como ventana emergente.
- **Todos los campos de fecha usan calendario** (`mat-datepicker`) en español, formato
  `dd/mm/aaaa` y semana desde el lunes. También aceptan la fecha escrita a mano
  (`29/09/2026`, `29-9-26`…). Ver `core/utils/es-date-adapter.ts`.

---

## Búsquedas

Los buscadores de **clientes**, **empleados** y **facturas** aceptan texto libre,
**individual o combinado**. El texto se divide en palabras y **cada palabra debe
coincidir (total o parcialmente) con algún campo**. El orden de las palabras no importa.

| Escribes | Encuentra |
|---|---|
| `juan` | Cualquier persona con "juan" en nombres, apellidos o cédula (Juan, Juana, Juanes…) |
| `perez` | Todos los Pérez |
| `juan perez` / `perez juan` | Solo quienes tengan "juan" **y** "perez" |
| `perez gomez` | Por los dos apellidos |
| `1023` | Cédulas que contienen 1023 |
| `carlos 5233` | Nombre + parte de la cédula |

- Mayúsculas y tildes no importan: `perez` encuentra "Pérez" y viceversa (collation
  `utf8mb4_unicode_ci` de MySQL).
- Los espacios de más se ignoran, y `%` y `_` se buscan como texto literal.

Campos por buscador:

- **Clientes:** cédula, primer y segundo nombre, primer y segundo apellido (solo
  clientes activos). Se combina con el filtro de estado (Activo / Agotado / Sin plan).
- **Empleados:** cédula, nombres y apellidos.
- **Facturas:** número de factura; cédula, nombre y apellidos del cliente; cédula,
  nombre y apellido del vendedor; nombre de la persona del entreno diario. Se combina
  con el filtro de mes y año.

Implementación: `gym-backend/.../repository/BusquedaSpecs.java` (JPA Specifications:
AND entre palabras, OR entre campos).

---

## Reglas de negocio

### Facturas

- **MENSUALIDAD:** requiere cliente y plan. Si no se envían fechas, `fechaInicio` = hoy
  y `fechaFin` = inicio + duración del plan. `valorEsperado` = precio del plan;
  `valorPagado` puede ser menor (descuento) o mayor (pago extra).
- **DIARIO (entreno diario):** no tiene cliente registrado; **requiere el nombre de la
  persona** (`nombrePersona`) y un valor. El valor esperado es igual al pagado.
- `fechaFactura` la asigna el servidor (fecha de registro).
- El método de pago se guarda como texto (el nombre del método) en `factura.metodo_pago`.

### Estado de membresía del cliente

Se calcula con la última mensualidad (la de `fechaFin` más reciente):

| Estado | Condición |
|---|---|
| `ACTIVO` | `fechaFin` es hoy o posterior |
| `AGOTADO` | `fechaFin` ya pasó |
| `SIN_PLAN` | Nunca ha tenido mensualidad |

`diasRestantes` = días entre hoy y `fechaFin` (negativo si ya venció).

### Clientes

- Eliminar un cliente **no lo borra**: lo desactiva (`activo = 0`), deja de salir en
  listas y búsquedas y se le niega el acceso. Se reactiva desde su perfil.

### Métodos de pago

- El nombre se guarda en mayúsculas, es único y tiene máximo 20 caracteres.
- **Renombrar** un método actualiza también las facturas que ya lo usaban.
- Un método **usado en facturas no se puede eliminar**, solo desactivar. Los inactivos
  no aparecen al crear facturas, pero siguen visibles al editar una factura que los usa.

### Control de acceso (panel de ingreso)

- Si la cédula es de un **empleado** → acceso permitido.
- Si es de un **cliente**: se niega si está desactivado o si su membresía no está
  activa; se permite si su membresía está vigente.
- Cada intento queda registrado en la tabla `acceso` (PERMITIDO / DENEGADO y motivo).

---

## Modelo de datos

```
cliente (CC PK) ─┐                 ┌─ plan (id_plan PK)
                 │                 │
                 ├──< factura >────┤
vendedor (CC PK)─┘  (id_factura)   │
                        │
                        └──< detalle_factura (valor_esperado, valor_pagado)

metodo_pago (id_metodo_pago, nombre UNIQUE, activo)   ← catálogo; factura.metodo_pago guarda el nombre
acceso      (id_acceso, cc, tipo_persona, estado_acceso, fecha/hora)
```

| Tabla | Campos principales |
|---|---|
| `cliente` | `CC`, `nombre_1`, `nombre_2`, `apellido_1`, `apellido_2`, `fecha_nacimiento`, `telefono`, `correo`, `fecha_registro`, `activo` |
| `vendedor` | `CC`, nombres, apellidos, `cargo`, `telefono`, `correo` |
| `plan` | `id_plan`, `nombre`, `precio`, `duracion` (días), `descripcion` |
| `factura` | `id_factura`, `tipo` (MENSUALIDAD/DIARIO), `cliente_cc`, `plan_id`, `cc_vendedor`, `nombre_persona`, `metodo_pago`, `fecha_factura`, `fecha_inicio`, `fecha_fin` |
| `detalle_factura` | `id_detalle_factura`, `id_factura`, `descripcion`, `valor_esperado`, `valor_pagado` |
| `metodo_pago` | `id_metodo_pago`, `nombre`, `descripcion`, `activo` |
| `acceso` | `id_acceso`, `cc`, `tipo_persona`, `nombre`, `estado_acceso`, `motivo_denegacion`, `metodo`, `fecha_acceso`, `hora_acceso` |

---

## Estructura del código

### Backend (`gym-backend/src/main/java/com/gimnasio/`)

```
config/       CORS, seguridad (todo permitido, sin sesión), manejo global de errores,
              integración push del Dahua (desactivada por defecto)
controller/   Endpoints REST (/v1/...)
dto/          Objetos de respuesta (perfiles, resúmenes, reportes)
model/        Entidades JPA (Cliente, Vendedor, Plan, Factura, DetalleFactura,
              MetodoPago, Acceso)
repository/   Repositorios Spring Data + BusquedaSpecs (búsqueda combinada)
service/      Lógica de negocio
```

Errores: `GlobalExceptionHandler` responde `{ "status", "mensaje", "timestamp" }`:
404 si no existe el recurso, 400 por reglas de negocio o validación (con `errores` por
campo) y 500 para el resto (con stacktrace en el log).

### Frontend (`gym-frontend/src/app/`)

```
core/models/      Interfaces TypeScript (Plan, Cliente, Vendedor, Factura, MetodoPago)
core/services/    Un servicio HTTP por recurso + NavegacionService (pestañas nuevas)
core/utils/       fechas.ts (Date ↔ 'yyyy-MM-dd' en hora local), es-date-adapter.ts
modules/          Un módulo lazy por sección: dashboard, reportes, planes, clientes,
                  vendedores, facturas, metodos-pago
app.config.ts     Router, HttpClient y el calendario en español (global)
app.routes.ts     Rutas principales
```

> Hay archivos duplicados generados por el CLI (`*.ts`/`*.html` sin sufijo
> `.component`, `*-module.ts`, `app.module.ts`, `server.ts`…) que **no se usan**. La
> app arranca con `main.ts` → `app.config.ts` → `app.routes.ts` y usa los archivos
> `*.component.*` y `*.module.ts`.

---

## Configuración

### Backend — `gym-backend/src/main/resources/application.properties`

| Propiedad | Valor por defecto | Descripción |
|---|---|---|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/gym_db…` | Conexión MySQL |
| `spring.datasource.username` / `password` | `root` / (vacío) | Credenciales |
| `server.port` | `8080` | Puerto del backend |
| `server.servlet.context-path` | `/api` | Prefijo de todas las rutas |
| `torniquete.ip` | `192.168.0.150` | IP del torniquete Dahua |
| `torniquete.usuario` / `torniquete.password` | — | Credenciales del Dahua |
| `torniquete.canal` | `1` | Canal de la puerta |
| `torniquete.simulado` | `false` | `true` para probar sin dispositivo |
| `gym.dahua.push.habilitado` | (sin definir) | `true` reactiva la recepción de eventos del Dahua |

Cualquier propiedad se puede sobrescribir al ejecutar el jar, por ejemplo:
`java -jar gym-backend.jar --server.port=9090`.

### Frontend — `gym-frontend/src/environments/`

- `environment.ts` (desarrollo): `apiUrl = http://localhost:8080/api/v1`.
- `environment.prod.ts` (producción): `apiUrl` se arma con el host desde el que se abre
  la app, en el puerto 8080.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Todo da 404 contra la API | Controladores con `/api/v1` y context-path `/api` → rutas `/api/api/v1` | Los `@RequestMapping` deben empezar por `/v1/` |
| 404 al recargar o abrir un perfil en pestaña nueva en XAMPP | Falta `.htaccess` o `mod_rewrite` | Copiar `.htaccess` a `htdocs/gym/`; revisar `AllowOverride All` |
| Pantalla en blanco en `/gym/` | `base href` incorrecto | Compilar con `npx ng build` (producción ya usa `/gym/`) |
| Error de CORS desde otro PC | Origen no permitido | Añadir el patrón en `CorsConfig.java` |
| "Error interno del servidor" | Excepción no controlada | Ver el stacktrace en la consola del backend |
| La nueva factura no se abre en otra pestaña | El navegador bloqueó la ventana emergente | Permitir ventanas emergentes para el sitio |
| No aparece un método de pago al facturar | Está desactivado | Activarlo en *Métodos de pago* |

### Notas de seguridad

- La API **no tiene autenticación** (`SecurityConfig` permite todo). Úsala solo en la
  red local del gimnasio.
- Las credenciales del torniquete están escritas en el código (`TorniqueteService` y
  `environments/*.ts`). Conviene moverlas a `application.properties` o a variables de
  entorno y cambiarlas si el repositorio se comparte.
