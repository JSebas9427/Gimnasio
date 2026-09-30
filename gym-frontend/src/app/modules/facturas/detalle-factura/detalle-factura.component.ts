import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FacturaService, FacturaDTO } from '../../../core/services/factura.service';
import { NavegacionService } from '../../../core/services/navegacion.service';
import { FormFacturaComponent } from '../form-factura/form-factura.component';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrls: ['./detalle-factura.component.scss']
})
export class DetalleFacturaComponent implements OnInit {

  factura: FacturaDTO | null = null;
  cargando = true;
  error = false;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private facturaService: FacturaService,
    private dialog: MatDialog,
    public navegacion: NavegacionService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.facturaService.getById(this.id).subscribe({
      next: f => {
        this.factura = f;
        this.cargando = false;
        this.error = false;
        document.title = `Factura #${f.idFactura}`;
      },
      error: () => { this.cargando = false; this.error = true; }
    });
  }

  editar(): void {
    if (!this.factura) return;
    this.dialog.open(FormFacturaComponent, { width: '540px', data: { factura: this.factura } })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  imprimir(): void {
    window.print();
  }

  get nombreCliente(): string {
    const f = this.factura;
    if (!f) return '';
    if (f.cliente) return `${f.cliente.nombre1 ?? ''} ${f.cliente.apellido1 ?? ''}`.trim();
    return f.nombrePersona || 'Sin nombre';
  }

  get totalEsperado(): number {
    return this.factura?.detalles?.reduce((s, d) => s + (d.valorEsperado || 0), 0) ?? 0;
  }

  get totalPagado(): number {
    return this.factura?.detalles?.reduce((s, d) => s + (d.valorPagado || 0), 0) ?? 0;
  }

  get descuento(): number {
    return Math.max(this.totalEsperado - this.totalPagado, 0);
  }

  formatCOP(valor: number | undefined | null): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }
}
