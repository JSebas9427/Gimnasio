import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService, ClienteResumenDTO } from '../../../core/services/cliente.service';
import { FormClienteComponent } from '../form-cliente/form-cliente.component';
import { RegistroCompletoComponent } from '../registro-completo/registro-completo.component';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss']
})
export class ListaClientesComponent implements OnInit {

  clientes: ClienteResumenDTO[] = [];
  cargando = false;

  // Buscador
  terminoBusqueda = '';
  private busqueda$ = new Subject<string>();

  // Filtro estado
  estadoSeleccionado = 'TODOS';
  estadosFiltro = [
    { valor: 'TODOS',    label: 'Todos',       icon: 'people'           },
    { valor: 'ACTIVO',   label: 'Activos',      icon: 'check_circle'    },
    { valor: 'AGOTADO',  label: 'Agotados',     icon: 'warning'         },
    { valor: 'SIN_PLAN', label: 'Sin plan',     icon: 'person_off'      },
  ];

  columnas = ['estado', 'cc', 'nombreCompleto', 'telefono', 'ultimoPlan', 'ultimaFechaFin', 'diasRestantes', 'acciones'];

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();

    // Búsqueda con debounce — espera 350ms después de que el usuario deja de escribir
    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => this.cargar());
  }

  cargar(): void {
    this.cargando = true;
    this.clienteService.buscar(this.terminoBusqueda, this.estadoSeleccionado).subscribe({
      next: d => { this.clientes = d; this.cargando = false; },
      error: () => { this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 }); this.cargando = false; }
    });
  }

  onBusquedaChange(): void {
    this.busqueda$.next(this.terminoBusqueda);
  }

  setEstado(estado: string): void {
    this.estadoSeleccionado = estado;
    this.cargar();
  }

  verPerfil(cc: number): void {
    this.router.navigate(['/clientes', cc]);
  }

  abrirRegistroCompleto(): void {
    this.dialog.open(RegistroCompletoComponent, { width: '560px', disableClose: true })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  abrirFormulario(cc?: number): void {
    // Para editar necesitamos los datos completos del cliente
    if (cc) {
      this.clienteService.getById(cc).subscribe(cliente => {
        this.dialog.open(FormClienteComponent, { width: '540px', data: cliente })
          .afterClosed().subscribe(r => { if (r) this.cargar(); });
      });
    } else {
      this.dialog.open(FormClienteComponent, { width: '540px', data: null })
        .afterClosed().subscribe(r => { if (r) this.cargar(); });
    }
  }

  eliminar(cliente: ClienteResumenDTO): void {
    if (!confirm(`¿Eliminar a ${cliente.nombreCompleto}?`)) return;
    this.clienteService.delete(cliente.cc).subscribe({
      next: () => { this.snackBar.open('Cliente eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
    });
  }

  // ── Helpers de estado ─────────────────────────────────────────────────
  getEstadoClass(estado: string): string {
    return { 'ACTIVO': 'badge-activo', 'AGOTADO': 'badge-agotado', 'SIN_PLAN': 'badge-sin-plan' }[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    return { 'ACTIVO': 'Activo', 'AGOTADO': 'Agotado', 'SIN_PLAN': 'Sin plan' }[estado] ?? estado;
  }

  getDiasLabel(dias: number | null): string {
    if (dias === null) return '—';
    if (dias > 0)  return `${dias}d restantes`;
    if (dias === 0) return 'Vence hoy';
    return `Venció hace ${Math.abs(dias)}d`;
  }

  getDiasClass(dias: number | null): string {
    if (dias === null) return 'dias-null';
    if (dias > 5)  return 'dias-ok';
    if (dias >= 0) return 'dias-warning';
    return 'dias-vencido';
  }

  get conteoEstados() {
    return {
      activos:   this.clientes.filter(c => c.estado === 'ACTIVO').length,
      agotados:  this.clientes.filter(c => c.estado === 'AGOTADO').length,
      sinPlan:   this.clientes.filter(c => c.estado === 'SIN_PLAN').length,
    };
  }
}
