import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService } from '../../../core/services/vendedor.service';
import { Vendedor } from '../../../core/models/models';
import { FormVendedorComponent } from '../form-vendedor/form-vendedor.component';

@Component({
  selector: 'app-lista-vendedores',
  templateUrl: './lista-vendedores.component.html',
  styleUrls: ['./lista-vendedores.component.scss']
})
export class ListaVendedoresComponent implements OnInit {

  vendedores: Vendedor[] = [];
  cargando = false;
  terminoBusqueda = '';
  private busqueda$ = new Subject<string>();

  columnas = ['cc', 'nombreCompleto', 'cargo', 'telefono', 'correo', 'acciones'];

  constructor(
    private vendedorService: VendedorService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => this.cargar());
  }

  cargar(): void {
    this.cargando = true;
    this.vendedorService.buscar(this.terminoBusqueda).subscribe({
      next: d => { this.vendedores = d; this.cargando = false; },
      error: () => { this.snackBar.open('Error al cargar vendedores', 'Cerrar', { duration: 3000 }); this.cargando = false; }
    });
  }

  onBusquedaChange(): void {
    this.busqueda$.next(this.terminoBusqueda);
  }

  verPerfil(cc: number): void {
    this.router.navigate(['/vendedores', cc]);
  }

  abrir(vendedor?: Vendedor): void {
    this.dialog.open(FormVendedorComponent, { width: '540px', data: vendedor ?? null })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  eliminar(v: Vendedor): void {
    if (!confirm(`¿Eliminar a ${v.nombre1} ${v.apellido1}?`)) return;
    this.vendedorService.delete(v.cc).subscribe({
      next: () => { this.snackBar.open('Vendedor eliminado', 'Cerrar', { duration: 3000 }); this.cargar(); },
      error: () => this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 })
    });
  }
}
