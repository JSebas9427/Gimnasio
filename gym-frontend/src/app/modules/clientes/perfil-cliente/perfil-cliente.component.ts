import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService, ClientePerfilDTO } from '../../../core/services/cliente.service';
import { FormFacturaComponent } from '../../facturas/form-factura/form-factura.component';

@Component({
  selector: 'app-perfil-cliente',
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.scss']
})
export class PerfilClienteComponent implements OnInit {

  perfil: ClientePerfilDTO | null = null;
  cargando = true;
  cc!: number;

  columnasFacturas = ['idFactura', 'fechaFactura', 'tipo', 'planNombre', 'metodoPago', 'valor', 'vigencia'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cc = Number(this.route.snapshot.paramMap.get('cc'));
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.clienteService.getPerfil(this.cc).subscribe({
      next: d => { this.perfil = d; this.cargando = false; },
      error: () => {
        this.snackBar.open('Error al cargar el perfil', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  nuevaFactura(): void {
    this.dialog.open(FormFacturaComponent, {
      width: '520px',
      data: { ccPreseleccionado: this.cc }
    }).afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  getEstadoClass(estado: string): string {
    return { 'ACTIVO': 'badge-activo', 'AGOTADO': 'badge-agotado', 'SIN_PLAN': 'badge-sin-plan' }[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    return { 'ACTIVO': 'Membresía activa', 'AGOTADO': 'Membresía agotada', 'SIN_PLAN': 'Sin plan activo' }[estado] ?? estado;
  }

  getEstadoIcon(estado: string): string {
    return { 'ACTIVO': 'check_circle', 'AGOTADO': 'warning', 'SIN_PLAN': 'person_off' }[estado] ?? 'info';
  }

  getDiasLabel(dias: number | null): string {
    if (dias === null) return '—';
    if (dias > 0)  return `${dias} días restantes`;
    if (dias === 0) return 'Vence hoy';
    return `Venció hace ${Math.abs(dias)} días`;
  }

  getDiasClass(dias: number | null): string {
    if (dias === null) return 'dias-null';
    if (dias > 5)  return 'dias-ok';
    if (dias >= 0) return 'dias-warning';
    return 'dias-vencido';
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
}
