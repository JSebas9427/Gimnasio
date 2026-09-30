// Utilidades para convertir entre Date (lo que usa el datepicker) y 'yyyy-MM-dd' (lo que usa la API).
// Se trabaja siempre en hora local: new Date('2026-09-29') lo interpreta como UTC y en Colombia
// quedaría en el día anterior.

export function toApiDate(fecha: Date | string | null | undefined): string | null {
  if (!fecha) return null;
  if (typeof fecha === 'string') return fecha.substring(0, 10);
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseApiDate(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const [y, m, d] = valor.substring(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

export function hoy(): Date {
  const h = new Date();
  return new Date(h.getFullYear(), h.getMonth(), h.getDate());
}
