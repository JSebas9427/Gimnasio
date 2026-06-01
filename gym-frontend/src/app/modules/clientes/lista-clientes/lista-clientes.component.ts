import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/models';
import { FormClienteComponent } from '../form-cliente/form-cliente.component';
import { RegistroCompletoComponent } from '../registro-completo/registro-completo.component';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss']
})
export class ListaClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  columnas = ['cc', 'nombre', 'telefono', 'correo', 'fechaRegistro', 'acciones'];

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.cargarClientes(); }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes = data,
      error: () => this.mostrarMensaje('Error al cargar clientes')
    });
  }

  // Registro completo: cliente + factura en un solo formulario
  abrirRegistroCompleto(): void {
    this.dialog.open(RegistroCompletoComponent, { width: '560px', disableClose: true })
      .afterClosed().subscribe(r => { if (r) this.cargarClientes(); });
  }

  // Solo editar datos del cliente existente
  abrirFormulario(cliente: Cliente): void {
    this.dialog.open(FormClienteComponent, { width: '540px', data: cliente })
      .afterClosed().subscribe(r => { if (r) this.cargarClientes(); });
  }

  eliminar(cliente: Cliente): void {
    if (!confirm(`¿Eliminar al cliente ${cliente.nombre1} ${cliente.apellido1}?`)) return;
    this.clienteService.delete(cliente.cc).subscribe({
      next: () => { this.mostrarMensaje('Cliente eliminado'); this.cargarClientes(); },
      error: () => this.mostrarMensaje('Error al eliminar')
    });
  }

  mostrarMensaje(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
