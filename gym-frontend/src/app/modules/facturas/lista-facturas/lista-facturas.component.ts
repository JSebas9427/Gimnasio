import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacturaService } from '../../../core/services/factura.service';
import { Factura } from '../../../core/models/models';
import { FormFacturaComponent } from '../form-factura/form-factura.component';

@Component({
  selector: 'app-lista-facturas',
  templateUrl: './lista-facturas.component.html',
  styleUrls: ['./lista-facturas.component.scss']
})
export class ListaFacturasComponent implements OnInit {

  facturas: Factura[] = [];
  columnas = ['idFactura', 'tipo', 'cliente', 'vendedor', 'metodoPago', 'fechaFactura', 'vigencia', 'acciones'];

  constructor(
    private facturaService: FacturaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.facturaService.getAll().subscribe({
      next: d => this.facturas = d,
      error: () => this.msg('Error al cargar facturas')
    });
  }

  abrir(): void {
    this.dialog.open(FormFacturaComponent, { width: '520px', data: null })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  eliminar(f: Factura): void {
    if (!confirm(`¿Eliminar factura #${f.idFactura}?`)) return;
    this.facturaService.delete(f.idFactura!).subscribe({
      next: () => { this.msg('Factura eliminada'); this.cargar(); },
      error: () => this.msg('Error al eliminar')
    });
  }

  msg(m: string): void { this.snackBar.open(m, 'Cerrar', { duration: 3000 }); }
}
