import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { MetodoPago } from '../../../core/models/models';
import { FormMetodoPagoComponent } from '../form-metodo-pago/form-metodo-pago.component';

@Component({
  selector: 'app-lista-metodos-pago',
  templateUrl: './lista-metodos-pago.component.html',
  styleUrls: ['./lista-metodos-pago.component.scss']
})
export class ListaMetodosPagoComponent implements OnInit {

  metodos: MetodoPago[] = [];
  columnas = ['nombre', 'descripcion', 'activo', 'acciones'];
  cargando = false;

  constructor(
    private metodoPagoService: MetodoPagoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.metodoPagoService.getAll().subscribe({
      next: d => { this.metodos = d; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar los métodos de pago'); this.cargando = false; }
    });
  }

  abrirFormulario(metodo?: MetodoPago): void {
    this.dialog.open(FormMetodoPagoComponent, { width: '440px', data: metodo ?? null })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  cambiarEstado(metodo: MetodoPago): void {
    const activo = !metodo.activo;
    this.metodoPagoService.update(metodo.idMetodoPago!, { ...metodo, activo }).subscribe({
      next: () => {
        metodo.activo = activo;
        this.mostrarMensaje(`"${metodo.nombre}" ${activo ? 'activado' : 'desactivado'}`);
      },
      error: e => { this.mostrarMensaje(e.error?.mensaje ?? 'Error al cambiar el estado'); this.cargar(); }
    });
  }

  eliminar(metodo: MetodoPago): void {
    if (!confirm(`¿Eliminar el método de pago "${metodo.nombre}"?`)) return;
    this.metodoPagoService.delete(metodo.idMetodoPago!).subscribe({
      next: () => { this.mostrarMensaje('Método de pago eliminado'); this.cargar(); },
      error: e => this.mostrarMensaje(e.error?.mensaje ?? 'Error al eliminar el método de pago', 6000)
    });
  }

  mostrarMensaje(msg: string, duration = 3000): void {
    this.snackBar.open(msg, 'Cerrar', { duration });
  }
}
