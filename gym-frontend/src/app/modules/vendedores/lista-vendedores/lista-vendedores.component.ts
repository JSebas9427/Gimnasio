import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService } from '../../../core/services/vendedor.service';
import { Vendedor } from '../../../core/models/models';
import { FormVendedorComponent } from '../form-vendedor/form-vendedor.component';

@Component({ selector: 'app-lista-vendedores', templateUrl: './lista-vendedores.component.html', styleUrls: ['./lista-vendedores.component.scss'] })
export class ListaVendedoresComponent implements OnInit {
  vendedores: Vendedor[] = [];
  columnas = ['cc', 'nombre', 'cargo', 'telefono', 'correo', 'acciones'];

  constructor(private vendedorService: VendedorService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.vendedorService.getAll().subscribe({ next: d => this.vendedores = d, error: () => this.msg('Error al cargar') });
  }

  abrir(v?: Vendedor): void {
    this.dialog.open(FormVendedorComponent, { width: '540px', data: v ?? null })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  eliminar(v: Vendedor): void {
    if (!confirm(`¿Eliminar a ${v.nombre1} ${v.apellido1}?`)) return;
    this.vendedorService.delete(v.cc).subscribe({ next: () => { this.msg('Vendedor eliminado'); this.cargar(); }, error: () => this.msg('Error') });
  }

  msg(m: string): void { this.snackBar.open(m, 'Cerrar', { duration: 3000 }); }
}
