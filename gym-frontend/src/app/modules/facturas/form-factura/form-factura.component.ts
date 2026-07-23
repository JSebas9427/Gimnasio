import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FacturaService } from '../../../core/services/factura.service';
import { PlanService } from '../../../core/services/plan.service';
import { VendedorService } from '../../../core/services/vendedor.service';
import { Plan, Vendedor } from '../../../core/models/models';

@Component({
  selector: 'app-form-factura',
  templateUrl: './form-factura.component.html',
  styleUrls: ['./form-factura.component.scss']
})
export class FormFacturaComponent implements OnInit {

  form!: FormGroup;
  planes: Plan[] = [];
  vendedores: Vendedor[] = [];
  metodosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'NEQUI'];
  ccPreseleccionado: number | null = null;

  private hoy = new Date();
  private en30 = new Date(this.hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    private planService: PlanService,
    private vendedorService: VendedorService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<FormFacturaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data?.ccPreseleccionado) {
      this.ccPreseleccionado = this.data.ccPreseleccionado;
    }

    this.planService.getAll().subscribe(d => this.planes = d);
    this.vendedorService.getAll().subscribe(d => this.vendedores = d);

    this.form = this.fb.group({
      tipo:          ['MENSUALIDAD', Validators.required],
      ccVendedor:    ['', Validators.required],
      ccCliente:     [this.ccPreseleccionado ?? ''],
      idPlan:        [''],
      metodoPago:    ['EFECTIVO'],
      fechaInicio:   [this.toInputDate(this.hoy)],
      fechaFin:      [this.toInputDate(this.en30)],
      valorEsperado: [{ value: '', disabled: true }],
      valorPagado:   [''],
      descripcion:   ['Entreno diario'],
    });

    // Cuando cambia el plan → actualizar valor esperado y fechas
    this.form.get('idPlan')!.valueChanges.subscribe(idPlan => {
      const plan = this.planes.find(p => p.idPlan === idPlan);
      if (plan) {
        this.form.get('valorEsperado')!.setValue(plan.precio);
        if (!this.form.get('valorPagado')!.value) {
          this.form.get('valorPagado')!.setValue(plan.precio);
        }
        const inicio = new Date(this.form.get('fechaInicio')!.value);
        const fin = new Date(inicio.getTime() + plan.duracion * 24 * 60 * 60 * 1000);
        this.form.get('fechaFin')!.setValue(this.toInputDate(fin));
      }
    });

    // Cuando cambia fecha inicio → recalcular fecha fin
    this.form.get('fechaInicio')!.valueChanges.subscribe(fecha => {
      const idPlan = this.form.get('idPlan')!.value;
      const plan = this.planes.find(p => p.idPlan === idPlan);
      if (plan && fecha) {
        const inicio = new Date(fecha);
        const fin = new Date(inicio.getTime() + plan.duracion * 24 * 60 * 60 * 1000);
        this.form.get('fechaFin')!.setValue(this.toInputDate(fin), { emitEvent: false });
      }
    });

    // Ajustar validadores según tipo
    this.form.get('tipo')!.valueChanges.subscribe(tipo => {
      const c = this.form.controls;
      if (tipo === 'MENSUALIDAD') {
        c['ccCliente'].setValidators(Validators.required);
        c['idPlan'].setValidators(Validators.required);
        c['valorPagado'].setValidators([Validators.required, Validators.min(0)]);
      } else {
        c['ccCliente'].clearValidators();
        c['idPlan'].clearValidators();
        c['valorPagado'].setValidators([Validators.required, Validators.min(1)]);
        this.form.get('valorEsperado')!.setValue('');
      }
      Object.values(c).forEach(ctrl => ctrl.updateValueAndValidity());
    });

    this.form.get('tipo')!.updateValueAndValidity();
  }

  // ── Getters ───────────────────────────────────────────────────────────

  get esMensualidad(): boolean {
    return this.form.get('tipo')?.value === 'MENSUALIDAD';
  }

  get planSeleccionado(): Plan | undefined {
    return this.planes.find(p => p.idPlan === this.form.get('idPlan')?.value);
  }

  get diferencia(): number {
    const esperado = Number(this.form.get('valorEsperado')?.value) || 0;
    const pagado   = Number(this.form.get('valorPagado')?.value)   || 0;
    return pagado - esperado;
  }

  get hayDescuento(): boolean {
    const esperado = Number(this.form.get('valorEsperado')?.value) || 0;
    const pagado   = Number(this.form.get('valorPagado')?.value)   || 0;
    return esperado > 0 && pagado > 0 && pagado < esperado;
  }

  get hayPagoExtra(): boolean {
    return this.diferencia > 0;
  }

  get montoDescuento(): number {
    return Math.abs(this.diferencia);
  }

  get porcentajeDescuento(): number {
    const esperado = Number(this.form.get('valorEsperado')?.value) || 0;
    if (esperado === 0) return 0;
    return Math.round((this.montoDescuento / esperado) * 100);
  }

  // ── Guardar ───────────────────────────────────────────────────────────

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const factura: any = {
      tipo:        v.tipo,
      vendedor:    { cc: Number(v.ccVendedor) },
      metodoPago:  v.metodoPago || null,
      cliente:     v.ccCliente ? { cc: Number(v.ccCliente) }  : null,
      plan:        v.idPlan    ? { idPlan: Number(v.idPlan) } : null,
      fechaInicio: v.fechaInicio || null,
      fechaFin:    v.fechaFin    || null,
      detalles: [{
        descripcion:   this.esMensualidad
          ? `Mensualidad - ${this.planSeleccionado?.nombre ?? ''}`
          : (v.descripcion || 'Entreno diario'),
        valorEsperado: this.esMensualidad ? Number(v.valorEsperado) : Number(v.valorPagado),
        valorPagado:   Number(v.valorPagado)
      }]
    };

    this.facturaService.create(factura).subscribe({
      next: () => {
        this.snackBar.open('Factura registrada correctamente', 'Cerrar', { duration: 2500 });
        this.ref.close(true);
      },
      error: (e) => {
        this.snackBar.open(e.error?.mensaje ?? 'Error al registrar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancelar(): void { this.ref.close(false); }

  formatCOP(valor: any): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(Number(valor) || 0);
  }

  private toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
