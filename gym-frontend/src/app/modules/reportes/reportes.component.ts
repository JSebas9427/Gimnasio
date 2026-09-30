import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ReporteService, ReporteResumenDTO, ReporteIngresoDTO,
  ReporteIngresoDiaDTO, ReporteClienteNuevoDTO
} from '../../core/services/reporte.service';
import { AccesoService, AccesoDTO } from '../../core/services/acceso.service';
import { NavegacionService } from '../../core/services/navegacion.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  fechaInicioDate: Date = new Date();
  fechaFinDate:    Date = new Date();

  meses = [
    { valor: 0,  label: 'Todos los meses' },
    { valor: 1,  label: 'Enero'      }, { valor: 2,  label: 'Febrero'    },
    { valor: 3,  label: 'Marzo'      }, { valor: 4,  label: 'Abril'      },
    { valor: 5,  label: 'Mayo'       }, { valor: 6,  label: 'Junio'      },
    { valor: 7,  label: 'Julio'      }, { valor: 8,  label: 'Agosto'     },
    { valor: 9,  label: 'Septiembre' }, { valor: 10, label: 'Octubre'    },
    { valor: 11, label: 'Noviembre'  }, { valor: 12, label: 'Diciembre'  },
  ];

  anioActual = new Date().getFullYear();
  mesSeleccionado: number | null = null;

  resumen:        ReporteResumenDTO | null = null;
  ingresos:       ReporteIngresoDTO[]      = [];
  ingresosPorDia: ReporteIngresoDiaDTO[]   = [];
  clientesNuevos: ReporteClienteNuevoDTO[] = [];
  accesos:        AccesoDTO[]              = [];

  cargando = false;

  columnasIngresos = ['idFactura','fechaFactura','tipo','clienteNombre','vendedorNombre','planNombre','metodoPago','valor'];
  columnasClientes = ['cc','nombreCompleto','telefono','correo','planNombre','fechaRegistro'];
  columnasAccesos  = ['horaAcceso','cc','nombre','tipoPersona','metodo','estadoAcceso'];

  constructor(
    private reporteService: ReporteService,
    private accesoService:  AccesoService,
    private snackBar:       MatSnackBar,
    public  navegacion:     NavegacionService
  ) {}

  ngOnInit(): void { this.cargarTodo(); }

  cargarTodo(): void {
    const inicio = this.toApiDate(this.fechaInicioDate);
    const fin    = this.toApiDate(this.fechaFinDate);
    if (!inicio || !fin) return;

    this.cargando = true;
    let pendientes = 5;
    const done = () => { if (--pendientes === 0) this.cargando = false; };

    this.reporteService.getResumen(inicio, fin).subscribe({
      next: d => { this.resumen = d; done(); },
      error: () => { this.snackBar.open('Error al cargar resumen', 'Cerrar', { duration: 3000 }); done(); }
    });
    this.reporteService.getIngresos(inicio, fin).subscribe({ next: d => { this.ingresos = d; done(); }, error: () => done() });
    this.reporteService.getIngresosPorDia(inicio, fin).subscribe({ next: d => { this.ingresosPorDia = d; done(); }, error: () => done() });
    this.reporteService.getClientesNuevos(inicio, fin).subscribe({ next: d => { this.clientesNuevos = d; done(); }, error: () => done() });
    this.accesoService.getPorRango(inicio, fin).subscribe({ next: d => { this.accesos = d; done(); }, error: () => done() });
  }

  get totalTabla(): number { return this.ingresos.reduce((s, i) => s + (i.valor || 0), 0); }
  get totalMensualidadesTabla(): number { return this.ingresos.filter(i => i.tipo === 'MENSUALIDAD').reduce((s, i) => s + (i.valor || 0), 0); }
  get totalDiariosTabla(): number { return this.ingresos.filter(i => i.tipo === 'DIARIO').reduce((s, i) => s + (i.valor || 0), 0); }
  get totalAccesosPermitidos(): number { return this.accesos.filter(a => a.estadoAcceso === 'PERMITIDO').length; }
  get totalAccesosDenegados(): number  { return this.accesos.filter(a => a.estadoAcceso === 'DENEGADO').length;  }

  get maxDia(): number {
    if (!this.ingresosPorDia.length) return 1;
    return Math.max(...this.ingresosPorDia.map(d => Number(d.totalDia)));
  }

  getBarHeight(valor: number): number { return this.maxDia > 0 ? Math.round((valor / this.maxDia) * 140) : 0; }

  getDayLabel(fecha: string): string {
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return dias[new Date(fecha + 'T00:00:00').getDay()];
  }

  toApiDate(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Íconos/colores para los métodos conocidos; los creados en el CRUD usan uno genérico
  iconoMetodo(metodo: string): string {
    return ({ EFECTIVO: 'payments', TARJETA: 'credit_card', TRANSFERENCIA: 'swap_horiz', NEQUI: 'phone_android' } as Record<string, string>)[metodo] ?? 'account_balance_wallet';
  }

  claseMetodo(metodo: string): string {
    return ({ EFECTIVO: 'efectivo', TARJETA: 'tarjeta', TRANSFERENCIA: 'transferencia', NEQUI: 'nequi' } as Record<string, string>)[metodo] ?? 'otro';
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }

  setPeriodo(periodo: 'hoy' | 'semana' | 'mes'): void {
    this.mesSeleccionado = null;
    const hoy = new Date();
    this.fechaFinDate = new Date(hoy);
    if (periodo === 'hoy') {
      this.fechaInicioDate = new Date(hoy);
    } else if (periodo === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
      this.fechaInicioDate = lunes;
    } else {
      this.fechaInicioDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }
    this.cargarTodo();
  }

  seleccionarMes(mes: number): void {
    this.mesSeleccionado = mes;
    const hoy = new Date();
    this.fechaInicioDate = new Date(this.anioActual, mes, 1);
    const esActual = mes === hoy.getMonth() && this.anioActual === hoy.getFullYear();
    this.fechaFinDate = esActual ? new Date(hoy) : new Date(this.anioActual, mes + 1, 0);
    this.cargarTodo();
  }
}
