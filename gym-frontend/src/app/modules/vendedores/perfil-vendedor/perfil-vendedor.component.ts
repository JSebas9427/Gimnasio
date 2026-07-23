import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService, VendedorPerfilDTO, PeriodoVendedor } from '../../../core/services/vendedor.service';
import { FormVendedorComponent } from '../form-vendedor/form-vendedor.component';

@Component({
  selector: 'app-perfil-vendedor',
  templateUrl: './perfil-vendedor.component.html',
  styleUrls: ['./perfil-vendedor.component.scss']
})
export class PerfilVendedorComponent implements OnInit {

  perfil: VendedorPerfilDTO | null = null;
  cargando = false;
  cc!: number;

  periodoActivo: PeriodoVendedor = 'todas';

  periodos: { valor: PeriodoVendedor; label: string; icon: string }[] = [
    { valor: 'todas',  label: 'Todas',      icon: 'all_inclusive'  },
    { valor: 'hoy',    label: 'Hoy',         icon: 'today'          },
    { valor: 'semana', label: 'Esta semana', icon: 'date_range'     },
    { valor: 'mes',    label: 'Este mes',    icon: 'calendar_month' },
    { valor: 'anio',   label: 'Este año',   icon: 'event_note'     },
  ];

  columnasFacturas = ['idFactura', 'fechaFactura', 'tipo', 'cliente', 'planNombre', 'metodoPago', 'valor'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vendedorService: VendedorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cc = Number(this.route.snapshot.paramMap.get('cc'));
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.vendedorService.getPerfil(this.cc, this.periodoActivo).subscribe({
      next: d => { this.perfil = d; this.cargando = false; },
      error: () => {
        this.snackBar.open('Error al cargar el perfil', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  cambiarPeriodo(periodo: PeriodoVendedor): void {
    this.periodoActivo = periodo;
    this.cargar();
  }

  volver(): void {
    this.router.navigate(['/vendedores']);
  }

  editarVendedor(): void {
    this.vendedorService.getById(this.cc).subscribe(vendedor => {
      this.dialog.open(FormVendedorComponent, {
        width: '540px',
        data: vendedor
      }).afterClosed().subscribe(r => {
        if (r) this.cargar(); // recargar perfil si hubo cambios
      });
    });
  }

  getValorFactura(factura: any): number {
    if (!factura.detalles?.length) return 0;
    return factura.detalles.reduce((s: number, d: any) => s + (d.valorPagado || 0), 0);
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }

  getPeriodoLabel(): string {
    return this.periodos.find(p => p.valor === this.periodoActivo)?.label ?? '';
  }
}
