import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacturaService, FacturaDTO } from '../../../core/services/factura.service';
import { FormFacturaComponent } from '../form-factura/form-factura.component';

@Component({
  selector: 'app-lista-facturas',
  templateUrl: './lista-facturas.component.html',
  styleUrls: ['./lista-facturas.component.scss']
})
export class ListaFacturasComponent implements OnInit {

  facturas: FacturaDTO[] = [];
  cargando = false;

  // ── Buscador ──────────────────────────────────────────────────────────
  terminoBusqueda = '';
  private busqueda$ = new Subject<string>();

  // ── Filtro por mes ────────────────────────────────────────────────────
  mesSeleccionado  = 0;
  anioSeleccionado = new Date().getFullYear();

  meses = [
    { valor: 0,  label: 'Todos los meses' },
    { valor: 1,  label: 'Enero'      },
    { valor: 2,  label: 'Febrero'    },
    { valor: 3,  label: 'Marzo'      },
    { valor: 4,  label: 'Abril'      },
    { valor: 5,  label: 'Mayo'       },
    { valor: 6,  label: 'Junio'      },
    { valor: 7,  label: 'Julio'      },
    { valor: 8,  label: 'Agosto'     },
    { valor: 9,  label: 'Septiembre' },
    { valor: 10, label: 'Octubre'    },
    { valor: 11, label: 'Noviembre'  },
    { valor: 12, label: 'Diciembre'  },
  ];

  anios: number[] = [];

  columnas = ['idFactura', 'fechaFactura', 'tipo', 'clienteCc', 'vendedorCc', 'plan', 'metodoPago', 'valorEsperado', 'valorPagado'];

  constructor(
    private facturaService: FacturaService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Generar lista de años (5 años atrás hasta el actual)
    const actual = new Date().getFullYear();
    for (let i = actual; i >= actual - 4; i--) this.anios.push(i);

    this.cargar();

    this.busqueda$.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => this.cargar());
  }

  cargar(): void {
    this.cargando = true;
    this.facturaService.buscar(
      this.terminoBusqueda,
      this.mesSeleccionado,
      this.anioSeleccionado
    ).subscribe({
      next: d => { this.facturas = d; this.cargando = false; },
      error: () => { this.snackBar.open('Error al cargar facturas', 'Cerrar', { duration: 3000 }); this.cargando = false; }
    });
  }

  onBusquedaChange(): void {
    this.busqueda$.next(this.terminoBusqueda);
  }

  abrirFormulario(): void {
    this.dialog.open(FormFacturaComponent, { width: '540px', data: null })
      .afterClosed().subscribe(r => { if (r) this.cargar(); });
  }

  irPerfilCliente(cc: number | undefined): void {
    if (cc) this.router.navigate(['/clientes', cc]);
  }

  irPerfilVendedor(cc: number | undefined): void {
    if (cc) this.router.navigate(['/vendedores', cc]);
  }

  // ── Helpers de totales ────────────────────────────────────────────────
  getValorEsperado(f: FacturaDTO): number {
    return f.detalles?.reduce((s, d) => s + (d.valorEsperado || 0), 0) ?? 0;
  }

  getValorPagado(f: FacturaDTO): number {
    return f.detalles?.reduce((s, d) => s + (d.valorPagado || 0), 0) ?? 0;
  }

  getDiferencia(f: FacturaDTO): number {
    return this.getValorPagado(f) - this.getValorEsperado(f);
  }

  get totalEsperado(): number {
    return this.facturas.reduce((s, f) => s + this.getValorEsperado(f), 0);
  }

  get totalPagado(): number {
    return this.facturas.reduce((s, f) => s + this.getValorPagado(f), 0);
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor || 0);
  }
}
