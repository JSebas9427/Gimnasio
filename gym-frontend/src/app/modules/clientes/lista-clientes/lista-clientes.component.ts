import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavegacionService } from '../../../core/services/navegacion.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService, ClienteResumenDTO } from '../../../core/services/cliente.service';
import { FormClienteComponent } from '../form-cliente/form-cliente.component';
import { RegistroCompletoComponent } from '../registro-completo/registro-completo.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss']
})
export class ListaClientesComponent implements OnInit, AfterViewInit {

clientes = new MatTableDataSource<ClienteResumenDTO>([]);
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild(MatSort) sort!: MatSort;

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
    private navegacion: NavegacionService,
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
  ngAfterViewInit(): void {
  this.clientes.paginator = this.paginator;
  this.clientes.sort = this.sort;
}

cargar(): void {
  this.cargando = true;
  this.clienteService.buscar(this.terminoBusqueda, this.estadoSeleccionado).subscribe({
    next: d => {
      this.clientes.data = d;
      this.cargando = false;
    },
    error: () => {
      this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      this.cargando = false;
    }
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
    this.navegacion.perfilCliente(cc);
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
  if (!confirm(`¿Desactivar a ${cliente.nombreCompleto}? El cliente no aparecerá en las listas pero sus facturas se conservarán.`)) return;
  this.clienteService.delete(cliente.cc).subscribe({
    next: () => {
      this.snackBar.open(`${cliente.nombreCompleto} fue desactivado`, 'Cerrar', { duration: 3000 });
      this.cargar();
    },
    error: (e) => {
      const msg = e.error?.mensaje ?? 'Error al desactivar el cliente';
      this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
    }
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
    activos:  this.clientes.data.filter(c => c.estado === 'ACTIVO').length,
    agotados: this.clientes.data.filter(c => c.estado === 'AGOTADO').length,
    sinPlan:  this.clientes.data.filter(c => c.estado === 'SIN_PLAN').length,
  };
}
}
