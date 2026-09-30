import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DashboardService, DashboardResumenDTO, EstadoMembresiasDTO,
         ClienteProximoVencerDTO, ClienteBusquedaRapidaDTO } from '../../core/services/dashboard.service';
import { TorniqueteService, EstadoTorniquete } from '../../core/services/torniquete.service';
import { AccesoService, AccesoDTO } from '../../core/services/acceso.service';
import { CumpleaniosService, CumpleaniosDTO } from '../../core/services/cumpleanios.service';
import { NavegacionService } from '../../core/services/navegacion.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  resumen: DashboardResumenDTO | null = null;
  estadoMembresias: EstadoMembresiasDTO | null = null;
  proximosVencer: ClienteProximoVencerDTO[] = [];
  cargando = true;

  ccBusqueda = '';
  clienteIngreso: ClienteBusquedaRapidaDTO | null = null;
  buscandoCliente = false;
  clienteNoEncontrado = false;
  abriendo = false;

  estadoTorniquete: EstadoTorniquete = 'VERIFICANDO';
  modoSimulado = false;

  registrosAcceso: AccesoDTO[] = [];
  columnasAcceso = ['horaAcceso', 'cc', 'nombre', 'tipoPersona', 'metodo', 'estadoAcceso'];

  cumpleaniosMes: CumpleaniosDTO[] = [];
  cumpleaniosHoy: CumpleaniosDTO[] = [];

  diasVencimiento = 7;
  private subs = new Subscription();

  constructor(
    private dashboardService:   DashboardService,
    private torniqueteService:  TorniqueteService,
    private accesoService:      AccesoService,
    private cumpleaniosService: CumpleaniosService,
    private router:   Router,
    private navegacion: NavegacionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.modoSimulado = this.torniqueteService.modoSimulado;
    this.cargarTodo();
    this.verificarTorniquete();
    this.cargarAccesosHoy();
    this.cargarCumpleanios();

    const subT = interval(30000).pipe(switchMap(() => this.torniqueteService.verificarConexion()))
                                .subscribe(e => this.estadoTorniquete = e);
    const subA = interval(60000).subscribe(() => this.cargarAccesosHoy());
    this.subs.add(subT);
    this.subs.add(subA);
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  cargarTodo(): void {
    this.cargando = true;
    let p = 3;
    const done = () => { if (--p === 0) this.cargando = false; };
    this.dashboardService.getResumen().subscribe({ next: d => { this.resumen = d; done(); }, error: () => done() });
    this.dashboardService.getEstadoMembresias().subscribe({ next: d => { this.estadoMembresias = d; done(); }, error: () => done() });
    this.dashboardService.getProximosAVencer(this.diasVencimiento).subscribe({ next: d => { this.proximosVencer = d; done(); }, error: () => done() });
  }

  cargarAccesosHoy(): void {
    this.accesoService.getHoy().subscribe({ next: d => this.registrosAcceso = d, error: () => {} });
  }

  cargarCumpleanios(): void {
    this.cumpleaniosService.getMes().subscribe({ next: d => this.cumpleaniosMes = d, error: () => {} });
    this.cumpleaniosService.getHoy().subscribe({ next: d => this.cumpleaniosHoy = d, error: () => {} });
  }

  cambiarDiasVencimiento(dias: number): void {
    this.diasVencimiento = dias;
    this.dashboardService.getProximosAVencer(dias).subscribe({ next: d => this.proximosVencer = d });
  }

  buscarCliente(): void {
    const cc = Number(this.ccBusqueda);
    if (!cc) return;
    this.buscandoCliente = true;
    this.clienteIngreso = null;
    this.clienteNoEncontrado = false;
    this.dashboardService.buscarClienteIngreso(cc).subscribe({
      next: d => { this.clienteIngreso = d; this.buscandoCliente = false; },
      error: () => { this.clienteNoEncontrado = true; this.buscandoCliente = false; }
    });
  }

  onCCKeydown(event: KeyboardEvent): void { if (event.key === 'Enter') this.buscarCliente(); }

  limpiarBusqueda(): void {
    this.ccBusqueda = '';
    this.clienteIngreso = null;
    this.clienteNoEncontrado = false;
  }

  permitirAcceso(): void {
    if (!this.clienteIngreso) return;
    this.abriendo = true;
    this.torniqueteService.registrarAcceso(this.clienteIngreso.cc ?? 0, this.clienteIngreso.accesoPermitido)
      .subscribe(resultado => {
        this.abriendo = false;
        this.snackBar.open(resultado.mensaje, 'Cerrar', { duration: 3000 });
        this.accesoService.registrar({
          cc:               this.clienteIngreso!.cc ?? null,
          tipoPersona:      this.clienteIngreso!.tipoPersona,
          nombre:           this.clienteIngreso!.nombreCompleto,
          estadoAcceso:     resultado.exito ? 'PERMITIDO' : 'DENEGADO',
          motivoDenegacion: this.clienteIngreso!.motivoDenegacion ?? null,
          metodo:           'CC_MANUAL'
        }).subscribe({
          next: nuevo => {
            this.registrosAcceso = [nuevo, ...this.registrosAcceso];
            this.dashboardService.getResumen().subscribe(r => this.resumen = r);
          },
          error: () => {}
        });
        if (resultado.exito) this.limpiarBusqueda();
      });
  }

  abrirManual(): void {
    this.abriendo = true;
    this.torniqueteService.abrirTorniquete().subscribe(r => {
      this.abriendo = false;
      this.snackBar.open(r.mensaje, 'Cerrar', { duration: 3000 });
    });
  }

  verificarTorniquete(): void {
    this.estadoTorniquete = 'VERIFICANDO';
    this.torniqueteService.verificarConexion().subscribe(e => this.estadoTorniquete = e);
  }

  verPerfilCliente(cc: number | null): void  { this.navegacion.perfilCliente(cc); }
  verPerfilVendedor(cc: number | null): void { this.navegacion.perfilVendedor(cc); }

  // Tabla de accesos: abre el perfil del cliente o del empleado en una pestaña nueva
  verPerfilAcceso(r: AccesoDTO): void {
    if (!r.cc) return;
    if (r.tipoPersona === 'EMPLEADO') this.verPerfilVendedor(r.cc);
    else this.verPerfilCliente(r.cc);
  }

  getSvgPath(porcentaje: number, inicio: number): string {
    const r = 70, cx = 90, cy = 90;
    const ang = (porcentaje / 100) * 360;
    const rad = (deg: number) => (deg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(rad(inicio));
    const y1 = cy + r * Math.sin(rad(inicio));
    const x2 = cx + r * Math.cos(rad(inicio + ang));
    const y2 = cy + r * Math.sin(rad(inicio + ang));
    const grande = ang > 180 ? 1 : 0;
    if (porcentaje >= 100) return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${grande} 1 ${x2} ${y2} Z`;
  }

  get inicioAgotados(): number { return (this.estadoMembresias?.porcentajeActivos ?? 0) * 3.6; }
  get inicioSinPlan():  number { return this.inicioAgotados + (this.estadoMembresias?.porcentajeAgotados ?? 0) * 3.6; }

  getMesNombre(): string {
    const m = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return m[new Date().getMonth()];
  }

  getDiasLabel(dias: number): string {
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return '1 día';
    if (dias < 0)  return `Venció hace ${Math.abs(dias)}d`;
    return `${dias} días`;
  }

  getDiasClass(dias: number): string {
    if (dias <= 0) return 'dias-vencido';
    if (dias <= 3) return 'dias-urgente';
    if (dias <= 7) return 'dias-warning';
    return 'dias-ok';
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }
}
