import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ReporteService,
  ReporteResumenDTO,
  ReporteIngresoDTO,
  ReporteIngresoDiaDTO,
  ReporteClienteNuevoDTO
} from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  // ── Filtro de fechas (objetos Date para MatDatepicker) ────────────────
  fechaInicioDate: Date = new Date();
  fechaFinDate:    Date = new Date();

  // ── Selector de mes ───────────────────────────────────────────────────
  meses = [
    { valor: 0,  label: 'Enero'      },
    { valor: 1,  label: 'Febrero'    },
    { valor: 2,  label: 'Marzo'      },
    { valor: 3,  label: 'Abril'      },
    { valor: 4,  label: 'Mayo'       },
    { valor: 5,  label: 'Junio'      },
    { valor: 6,  label: 'Julio'      },
    { valor: 7,  label: 'Agosto'     },
    { valor: 8,  label: 'Septiembre' },
    { valor: 9,  label: 'Octubre'    },
    { valor: 10, label: 'Noviembre'  },
    { valor: 11, label: 'Diciembre'  },
  ];

  anioActual  = new Date().getFullYear();
  mesSeleccionado: number | null = null; // null = sin selección de mes

  // ── Datos ─────────────────────────────────────────────────────────────
  resumen:        ReporteResumenDTO | null = null;
  ingresos:       ReporteIngresoDTO[]      = [];
  ingresosPorDia: ReporteIngresoDiaDTO[]   = [];
  clientesNuevos: ReporteClienteNuevoDTO[] = [];

  // ── Estado ────────────────────────────────────────────────────────────
  cargando = false;

  // ── Columnas tablas ───────────────────────────────────────────────────
  columnasIngresos = ['idFactura','fechaFactura','tipo','clienteNombre','vendedorNombre','planNombre','metodoPago','valor'];
  columnasClientes = ['cc','nombreCompleto','telefono','correo','planNombre','fechaRegistro'];

  constructor(
    private reporteService: ReporteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  // ── Carga de datos ────────────────────────────────────────────────────
  cargarTodo(): void {
    const inicio = this.toApiDate(this.fechaInicioDate);
    const fin    = this.toApiDate(this.fechaFinDate);
    if (!inicio || !fin) return;

    this.cargando = true;
    let pendientes = 4;
    const done = () => { if (--pendientes === 0) this.cargando = false; };

    this.reporteService.getResumen(inicio, fin).subscribe({
      next: d => { this.resumen = d; done(); },
      error: () => { this.snackBar.open('Error al cargar resumen', 'Cerrar', { duration: 3000 }); done(); }
    });
    this.reporteService.getIngresos(inicio, fin).subscribe({
      next: d => { this.ingresos = d; done(); },
      error: () => done()
    });
    this.reporteService.getIngresosPorDia(inicio, fin).subscribe({
      next: d => { this.ingresosPorDia = d; done(); },
      error: () => done()
    });
    this.reporteService.getClientesNuevos(inicio, fin).subscribe({
      next: d => { this.clientesNuevos = d; done(); },
      error: () => done()
    });
  }

  // ── Botones rápidos de período ────────────────────────────────────────
  setPeriodo(periodo: 'hoy' | 'semana' | 'mes'): void {
    this.mesSeleccionado = null;
    const hoy = new Date();

    if (periodo === 'hoy') {
      this.fechaInicioDate = new Date(hoy);
      this.fechaFinDate    = new Date(hoy);
    } else if (periodo === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
      this.fechaInicioDate = lunes;
      this.fechaFinDate    = new Date(hoy);
    } else {
      this.fechaInicioDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaFinDate    = new Date(hoy);
    }
    this.cargarTodo();
  }

  // ── Selector de mes ───────────────────────────────────────────────────
  seleccionarMes(mes: number): void {
    this.mesSeleccionado = mes;
    const hoy = new Date();
    const anio = this.anioActual;

    this.fechaInicioDate = new Date(anio, mes, 1);

    // Si es el mes actual, fin = hoy; si no, último día del mes
    const esActual = mes === hoy.getMonth() && anio === hoy.getFullYear();
    this.fechaFinDate = esActual
      ? new Date(hoy)
      : new Date(anio, mes + 1, 0); // día 0 del mes siguiente = último del mes

    this.cargarTodo();
  }

  // ── Totales calculados ────────────────────────────────────────────────
  get totalTabla(): number {
    return this.ingresos.reduce((s, i) => s + (i.valor || 0), 0);
  }
  get totalMensualidadesTabla(): number {
    return this.ingresos.filter(i => i.tipo === 'MENSUALIDAD').reduce((s, i) => s + (i.valor || 0), 0);
  }
  get totalDiariosTabla(): number {
    return this.ingresos.filter(i => i.tipo === 'DIARIO').reduce((s, i) => s + (i.valor || 0), 0);
  }

  // ── Gráfica SVG ───────────────────────────────────────────────────────
  get maxDia(): number {
    if (!this.ingresosPorDia.length) return 1;
    return Math.max(...this.ingresosPorDia.map(d => Number(d.totalDia)));
  }
  getBarHeight(valor: number): number {
    return this.maxDia > 0 ? Math.round((valor / this.maxDia) * 140) : 0;
  }
  getDayLabel(fecha: string): string {
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return dias[new Date(fecha + 'T00:00:00').getDay()];
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  // Para enviar al backend: usa fecha local, no UTC
  toApiDate(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }
}
