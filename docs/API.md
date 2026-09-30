# Referencia de la API REST

URL base: `http://<servidor>:8080/api/v1`. Todas las respuestas son JSON.

Formatos:
- Fechas `yyyy-MM-dd` (ej. `2026-09-29`); `fechaRegistro` del cliente es fecha y hora.
- Montos en pesos colombianos, como número (`80000`).
- Errores: `{ "status": 400, "mensaje": "...", "timestamp": "..." }`. En errores de
  validación viene `errores: { campo: mensaje }` en lugar de `mensaje`.

| Código | Significado |
|---|---|
| 200 / 201 / 204 | OK / creado / sin contenido |
| 400 | Regla de negocio, validación o registro con datos asociados |
| 404 | Recurso o ruta inexistente |
| 500 | Error no controlado (ver log del backend) |

---

## Clientes — `/clientes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/clientes` | Todos los clientes (entidad completa) |
| GET | `/clientes/con-estado` | Clientes activos con estado de membresía (`ClienteResumenDTO`) |
| GET | `/clientes/buscar?q=&estado=` | Búsqueda combinada (ver abajo). `estado`: `ACTIVO`, `AGOTADO`, `SIN_PLAN` o `TODOS` |
| GET | `/clientes/{cc}` | Un cliente |
| GET | `/clientes/{cc}/perfil` | Perfil: datos, estado, días restantes y todas sus facturas |
| POST | `/clientes` | Crear |
| PUT | `/clientes/{cc}` | Actualizar |
| DELETE | `/clientes/{cc}` | **Desactivar** (`activo = 0`); no borra |
| PATCH | `/clientes/{cc}/reactivar` | Reactivar |

**Búsqueda `q`:** palabras separadas por espacio; cada una debe coincidir con la cédula,
un nombre o un apellido. Ejemplos: `q=juan`, `q=juan perez`, `q=perez gomez`, `q=1023`.

```json
// POST /clientes
{
  "cc": 1023456789,
  "nombre1": "Juan", "nombre2": "David",
  "apellido1": "Pérez", "apellido2": "Gómez",
  "fechaNacimiento": "1995-09-30",
  "telefono": "3001234567",
  "correo": "juan@correo.com"
}
```

`ClienteResumenDTO`: `cc`, `nombreCompleto`, `telefono`, `correo`, `fechaRegistro`,
`estado`, `ultimaFechaFin`, `ultimoPlan`, `diasRestantes`.

---

## Empleados / vendedores — `/vendedores`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/vendedores` | Todos |
| GET | `/vendedores/buscar?q=` | Búsqueda combinada por cédula, nombres y apellidos |
| GET | `/vendedores/{cc}` | Uno |
| GET | `/vendedores/{cc}/perfil?periodo=` | Totales y facturas del período: `todas`, `hoy`, `semana`, `mes`, `anio` |
| POST | `/vendedores` | Crear (`cc`, `nombre1`, `nombre2`, `apellido1`, `apellido2`, `cargo`, `telefono`, `correo`) |
| PUT | `/vendedores/{cc}` | Actualizar |
| DELETE | `/vendedores/{cc}` | Eliminar (400 si tiene facturas asociadas) |

---

## Planes — `/planes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/planes` | Todos |
| GET | `/planes/{id}` | Uno |
| POST | `/planes` | Crear: `{ "nombre": "Básico", "precio": 80000, "duracion": 30, "descripcion": "..." }` |
| PUT | `/planes/{id}` | Actualizar |
| DELETE | `/planes/{id}` | Eliminar (400 si tiene facturas asociadas) |

---

## Métodos de pago — `/metodos-pago`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/metodos-pago?soloActivos=` | Todos, o solo los activos con `soloActivos=true` (orden alfabético) |
| GET | `/metodos-pago/{id}` | Uno |
| POST | `/metodos-pago` | Crear: `{ "nombre": "Daviplata", "descripcion": "...", "activo": true }` |
| PUT | `/metodos-pago/{id}` | Actualizar. Si cambia el nombre, **se actualizan las facturas** que lo usaban |
| DELETE | `/metodos-pago/{id}` | Eliminar. **400 si está en uso** en alguna factura (desactívalo en su lugar) |

El nombre se guarda en mayúsculas, sin espacios al inicio o al final, es único y tiene
máximo 20 caracteres.

---

## Facturas — `/facturas`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/facturas` | Todas |
| GET | `/facturas/buscar?q=&mes=&anio=` | Búsqueda combinada + filtro de mes (1-12) y año; `0` o sin enviar = sin filtro. Orden: más recientes primero |
| GET | `/facturas/{id}` | Una |
| GET | `/facturas/cliente/{cc}` | Facturas de un cliente |
| GET | `/facturas/tipo/{tipo}` | Por tipo: `MENSUALIDAD` o `DIARIO` |
| POST | `/facturas` | Crear |
| PUT | `/facturas/{id}` | Actualizar |
| DELETE | `/facturas/{id}` | Eliminar (borra también sus detalles) |

**Búsqueda `q`:** cada palabra debe coincidir con el número de factura, la cédula, el
nombre o los apellidos del cliente, la cédula, el nombre o el apellido del vendedor, o el
nombre del entreno diario. Ejemplos: `q=juan perez`, `q=15`, `q=pedro`.

```json
// POST /facturas — mensualidad
{
  "tipo": "MENSUALIDAD",
  "cliente":  { "cc": 1023456789 },
  "plan":     { "idPlan": 1 },
  "vendedor": { "cc": 12345678 },
  "metodoPago": "EFECTIVO",
  "fechaInicio": "2026-09-29",
  "fechaFin": "2026-10-29",
  "detalles": [ { "descripcion": "Mensualidad - Básico", "valorPagado": 70000 } ]
}
```

```json
// POST /facturas — entreno diario (nombrePersona es obligatorio)
{
  "tipo": "DIARIO",
  "nombrePersona": "Pedro Salas",
  "vendedor": { "cc": 12345678 },
  "metodoPago": "NEQUI",
  "detalles": [ { "descripcion": "Entreno diario", "valorPagado": 15000 } ]
}
```

Respuesta (`FacturaResponseDTO`):

```json
{
  "idFactura": 15,
  "tipo": "MENSUALIDAD",
  "nombrePersona": null,
  "metodoPago": "EFECTIVO",
  "fechaFactura": "2026-09-29",
  "fechaInicio": "2026-09-29",
  "fechaFin": "2026-10-29",
  "cliente":  { "cc": 1023456789, "nombre1": "Juan", "apellido1": "Pérez" },
  "vendedor": { "cc": 12345678, "nombre1": "Admin", "apellido1": "Gimnasio" },
  "plan":     { "idPlan": 1, "nombre": "Básico", "precio": 80000 },
  "detalles": [ { "idDetalleFactura": 20, "descripcion": "Mensualidad - Básico",
                  "valorEsperado": 80000, "valorPagado": 70000 } ]
}
```

Reglas: una mensualidad requiere cliente y plan. Sin fechas, se usan hoy y hoy + duración
del plan. `valorEsperado` toma el precio del plan. Un entreno diario requiere
`nombrePersona` y al menos un detalle.

---

## Dashboard — `/dashboard`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/dashboard/resumen` | Ingresos de hoy y de la semana, conteo de clientes por estado, vencimientos (hoy, 3 y 7 días) y accesos de hoy |
| GET | `/dashboard/estado-membresias` | Activos / agotados / sin plan, con porcentajes |
| GET | `/dashboard/proximos-a-vencer?dias=7` | Clientes cuya última mensualidad vence dentro de N días |
| GET | `/dashboard/cliente-ingreso?cc=` | Verificación para el panel de ingreso: empleado o cliente, estado y si se permite el acceso (`accesoPermitido`, `motivoDenegacion`). 404 si la cédula no existe |

---

## Accesos — `/accesos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/accesos` | Registrar un intento: `{ "cc", "tipoPersona": "CLIENTE"/"EMPLEADO", "nombre", "estadoAcceso": "PERMITIDO"/"DENEGADO", "motivoDenegacion", "metodo": "CC_MANUAL"/"FACIAL"/"TARJETA" }` |
| GET | `/accesos/hoy` | Accesos de hoy |
| GET | `/accesos/resumen-hoy` | Totales de hoy: permitidos, denegados, clientes y empleados |
| GET | `/accesos?inicio=&fin=` | Accesos en un rango de fechas (por defecto, hoy) |
| GET | `/accesos/cliente/{cc}` | Historial de una persona |

---

## Torniquete — `/torniquete`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/torniquete/estado` | `{ exito, mensaje, estado: "CONECTADO"/"DESCONECTADO" }` |
| POST | `/torniquete/abrir` | Envía el comando de apertura al Dahua |

---

## Cumpleaños — `/cumpleanios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/cumpleanios/mes` | Clientes que cumplen años este mes (`dia`, `edad`, `esHoy`) |
| GET | `/cumpleanios/hoy` | Los que cumplen hoy |

---

## Reportes — `/reportes`

Parámetros: `inicio` y `fin` en `yyyy-MM-dd`. Por defecto se usa hoy (en
`ingresos-por-dia`, los últimos 7 días).

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reportes/resumen` | Totales del período: ingresos, mensualidades, diarios, cantidades y clientes nuevos. **`totalesPorMetodo`** trae cada método de pago con su total. Los campos `totalEfectivo`, `totalTarjeta`, `totalTransferencia` y `totalNequi` se mantienen por compatibilidad |
| GET | `/reportes/ingresos` | Facturas del período con su valor. `clienteNombre` incluye el nombre del entreno diario |
| GET | `/reportes/ingresos-por-dia` | Total y cantidad de facturas por día |
| GET | `/reportes/clientes-nuevos` | Clientes registrados en el período |

---

## Integración push del Dahua (desactivada)

Solo existe si `gym.dahua.push.habilitado=true`: abre un segundo conector en el puerto
8082 y los endpoints `POST /cgi-bin/api/autoRegist/connect` y `POST /api/v1/dahua/event`.
Hoy los eventos del dispositivo los procesa el programa externo "Control Torniquete",
así que se deja apagada para evitar registros de acceso duplicados.
