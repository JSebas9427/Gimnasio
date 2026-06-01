// ── Plan ──────────────────────────────────────────────
export interface Plan {
  idPlan?: number;
  nombre: string;
  precio: number;
  duracion: number;
  descripcion?: string;
}

// ── Cliente ───────────────────────────────────────────
export interface Cliente {
  cc: number;
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  fechaRegistro?: string;
  telefono?: string;
  correo?: string;
}

// ── Vendedor ──────────────────────────────────────────
export interface Vendedor {
  cc: number;
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  cargo?: string;
  telefono?: string;
  correo?: string;
}

// ── Factura ───────────────────────────────────────────
export type TipoFactura = 'MENSUALIDAD' | 'DIARIO';

export interface DetalleFactura {
  idDetalleFactura?: number;
  descripcion?: string;
  valorPagado: number;
}

export interface Factura {
  idFactura?: number;
  tipo: TipoFactura;
  cliente?: { cc: number };
  plan?: { idPlan: number };
  vendedor: { cc: number };
  metodoPago?: string;
  fechaFactura?: string;   // ← nuevo: fecha de emisión
  fechaInicio?: string;
  fechaFin?: string;
  detalles: DetalleFactura[];
}
