import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { FacturaService } from '../../../core/services/factura.service';
import { PlanService } from '../../../core/services/plan.service';
import { VendedorService } from '../../../core/services/vendedor.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { NavegacionService } from '../../../core/services/navegacion.service';
import { Plan, Vendedor } from '../../../core/models/models';
import { hoy, parseApiDate, sumarDias, toApiDate } from '../../../core/utils/fechas';

@Component({
  selector: 'app-form-factura',
  templateUrl: './form-factura.component.html',
  styleUrls: ['./form-factura.component.scss']
})
export class FormFacturaComponent implements OnInit {

  form!: FormGroup;
  planes: Plan[] = [];
  vendedores: Vendedor[] = [];
  metodosPago: string[] = [];
  ccPreseleccionado: number | null = null;
  guardando = false;
  esEdicion = false;
  facturaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturaService,
    private planService: PlanService,
    private vendedorService: VendedorService,
    private metodoPagoService: MetodoPagoService,
    private navegacion: NavegacionService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<FormFacturaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data?.ccPreseleccionado) {
      this.ccPreseleccionado = this.data.ccPreseleccionado;
    }
    if (this.data?.factura) {
      this.esEdicion = true;
      this.facturaId = this.data.factura.idFactura;
    }

    this.form = this.fb.group({
      tipo:          ['MENSUALIDAD', Validators.required],
      ccVendedor:    [this.data?.ccVendedorPreseleccionado ?? '', Validators.required],
      ccCliente:     [this.ccPreseleccionado ?? ''],
      nombrePersona: ['', Validators.maxLength(60)],
      idPlan:        [''],
      metodoPago:    ['', Validators.required],
      fechaInicio:   [hoy()],
      fechaFin:      [sumarDias(hoy(), 30)],
      valorEsperado: [{ value: '', disabled: true }],
      valorPagado:   [''],
      descripcion:   ['Entreno diario'],
    });

    forkJoin({
      planes:      this.planService.getAll(),
      vendedores:  this.vendedorService.getAll(),
      metodosPago: this.metodoPagoService.getActivos(),
    }).subscribe({
      next: ({ planes, vendedores, metodosPago }) => {
        this.planes = planes;
        this.vendedores = vendedores;
        this.metodosPago = metodosPago.map(m => m.nombre);

        if (this.esEdicion) {
          this.prellenarFormulario();
        } else if (this.metodosPago.length) {
          const porDefecto = this.metodosPago.includes('EFECTIVO') ? 'EFECTIVO' : this.metodosPago[0];
          this.form.get('metodoPago')!.setValue(porDefecto);
        }
      },
      error: () => this.snackBar.open('Error al cargar planes, vendedores o métodos de pago', 'Cerrar', { duration: 4000 })
    });

    // Cuando cambia el plan → actualizar valor esperado y fechas
    this.form.get('idPlan')!.valueChanges.subscribe(idPlan => {
      const plan = this.planes.find(p => p.idPlan === idPlan);
      if (plan) {
        this.form.get('valorEsperado')!.setValue(plan.precio);
        if (!this.form.get('valorPagado')!.value) {
          this.form.get('valorPagado')!.setValue(plan.precio);
        }
        this.recalcularFechaFin(plan);
      }
    });

    // Cuando cambia fecha inicio → recalcular fecha fin
    this.form.get('fechaInicio')!.valueChanges.subscribe(() => {
      const plan = this.planSeleccionado;
      if (plan) this.recalcularFechaFin(plan);
    });

    // Ajustar validadores según tipo
    this.form.get('tipo')!.valueChanges.subscribe(tipo => {
      const c = this.form.controls;
      if (tipo === 'MENSUALIDAD') {
        c['ccCliente'].setValidators(Validators.required);
        c['idPlan'].setValidators(Validators.required);
        c['nombrePersona'].setValidators(Validators.maxLength(60));
        c['valorPagado'].setValidators([Validators.required, Validators.min(0)]);
      } else {
        c['ccCliente'].clearValidators();
        c['idPlan'].clearValidators();
        c['nombrePersona'].setValidators([Validators.required, Validators.maxLength(60)]);
        c['valorPagado'].setValidators([Validators.required, Validators.min(1)]);
        this.form.get('valorEsperado')!.setValue('');
      }
      Object.values(c).forEach(ctrl => ctrl.updateValueAndValidity({ emitEvent: false }));
    });

    this.form.get('tipo')!.updateValueAndValidity();
  }

  private recalcularFechaFin(plan: Plan): void {
    const inicio: Date | null = this.form.get('fechaInicio')!.value;
    if (inicio) {
      this.form.get('fechaFin')!.setValue(sumarDias(inicio, plan.duracion), { emitEvent: false });
    }
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
    const pagado = Number(this.form.get('valorPagado')?.value) || 0;
    return pagado - esperado;
  }

  get hayDescuento(): boolean {
    const esperado = Number(this.form.get('valorEsperado')?.value) || 0;
    const pagado = Number(this.form.get('valorPagado')?.value) || 0;
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

  private prellenarFormulario(): void {
    const f = this.data.factura;
    if (!f) return;

    // Si la factura usa un método que ya fue desactivado, se mantiene como opción
    if (f.metodoPago && !this.metodosPago.includes(f.metodoPago)) {
      this.metodosPago = [...this.metodosPago, f.metodoPago];
    }

    this.form.patchValue({
      tipo:          f.tipo,
      ccVendedor:    f.vendedor?.cc ?? '',
      ccCliente:     f.cliente?.cc  ?? '',
      nombrePersona: f.nombrePersona ?? '',
      idPlan:        f.plan?.idPlan  ?? '',
      metodoPago:    f.metodoPago   ?? '',
      fechaInicio:   parseApiDate(f.fechaInicio),
      fechaFin:      parseApiDate(f.fechaFin),
      valorEsperado: f.detalles?.[0]?.valorEsperado ?? '',
      valorPagado:   f.detalles?.[0]?.valorPagado   ?? '',
      descripcion:   f.detalles?.[0]?.descripcion   ?? 'Entreno diario',
    });
    // patchValue de fechaInicio recalcula fechaFin: se restaura la guardada
    this.form.get('fechaFin')!.setValue(parseApiDate(f.fechaFin), { emitEvent: false });
  }

  // ── Guardar ───────────────────────────────────────────────────────────

  guardar(): void {
    if (this.form.invalid || this.guardando) return;
    this.guardando = true;
    const v = this.form.getRawValue();

    const factura: any = {
      tipo:          v.tipo,
      vendedor:      { cc: Number(v.ccVendedor) },
      metodoPago:    v.metodoPago || null,
      cliente:       this.esMensualidad && v.ccCliente ? { cc: Number(v.ccCliente) } : null,
      nombrePersona: this.esMensualidad ? null : String(v.nombrePersona).trim(),
      plan:          this.esMensualidad && v.idPlan ? { idPlan: Number(v.idPlan) } : null,
      fechaInicio:   this.esMensualidad ? toApiDate(v.fechaInicio) : null,
      fechaFin:      this.esMensualidad ? toApiDate(v.fechaFin) : null,
      detalles: [{
        descripcion:   this.esMensualidad
          ? `Mensualidad - ${this.planSeleccionado?.nombre ?? ''}`
          : (v.descripcion || 'Entreno diario'),
        valorEsperado: this.esMensualidad ? Number(v.valorEsperado) : Number(v.valorPagado),
        valorPagado:   Number(v.valorPagado)
      }]
    };

    // Al crear, la factura detallada se abre en una pestaña nueva.
    // Se reserva aquí (en el clic) para que el navegador no la bloquee.
    const pestana = this.esEdicion ? null : this.navegacion.reservarPestana();

    const operacion = this.esEdicion
      ? this.facturaService.update(this.facturaId!, factura)
      : this.facturaService.create(factura);

    operacion.subscribe({
      next: (guardada) => {
        this.snackBar.open(
          this.esEdicion ? 'Factura actualizada correctamente' : 'Factura registrada correctamente',
          'Cerrar', { duration: 2500 }
        );
        if (pestana && guardada?.idFactura) pestana.abrir(['/facturas', guardada.idFactura]);
        this.ref.close(true);
      },
      error: (e) => {
        pestana?.cerrar();
        this.guardando = false;
        this.snackBar.open(e.error?.mensaje ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancelar(): void { this.ref.close(false); }

  formatCOP(valor: any): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(Number(valor) || 0);
  }
}
