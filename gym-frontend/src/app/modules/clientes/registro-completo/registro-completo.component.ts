import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { FacturaService } from '../../../core/services/factura.service';
import { PlanService } from '../../../core/services/plan.service';
import { VendedorService } from '../../../core/services/vendedor.service';
import { Plan, Vendedor } from '../../../core/models/models';

@Component({
  selector: 'app-registro-completo',
  templateUrl: './registro-completo.component.html',
  styleUrls: ['./registro-completo.component.scss']
})
export class RegistroCompletoComponent implements OnInit {

  formCliente!: FormGroup;
  formFactura!: FormGroup;

  planes: Plan[] = [];
  vendedores: Vendedor[] = [];
  metodosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'NEQUI'];

  paso = 1; // 1 = datos cliente, 2 = datos factura
  guardando = false;

  private hoy = new Date();
  private en30 = new Date(this.hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private facturaService: FacturaService,
    private planService: PlanService,
    private vendedorService: VendedorService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<RegistroCompletoComponent>
  ) {}

  ngOnInit(): void {
    this.planService.getAll().subscribe(d => this.planes = d);
    this.vendedorService.getAll().subscribe(d => this.vendedores = d);

    this.formCliente = this.fb.group({
      cc:        ['', [Validators.required]],
      nombre1:   ['', [Validators.required, Validators.maxLength(20)]],
      nombre2:   ['', Validators.maxLength(20)],
      apellido1: ['', [Validators.required, Validators.maxLength(20)]],
      apellido2: ['', Validators.maxLength(20)],
      telefono:  ['', Validators.maxLength(10)],
      correo:    ['', [Validators.email, Validators.maxLength(50)]]
    });

    this.formFactura = this.fb.group({
      idPlan:      ['', Validators.required],
      ccVendedor:  ['', Validators.required],
      metodoPago:  ['EFECTIVO', Validators.required],
      fechaInicio: [this.toInputDate(this.hoy)],
      fechaFin:    [this.toInputDate(this.en30)]
    });

    // Recalcular fecha_fin cuando cambia el plan
    this.formFactura.get('idPlan')!.valueChanges.subscribe(idPlan => {
      const plan = this.planes.find(p => p.idPlan === idPlan);
      if (plan) {
        const inicio = new Date(this.formFactura.get('fechaInicio')!.value);
        const fin = new Date(inicio.getTime() + plan.duracion * 24 * 60 * 60 * 1000);
        this.formFactura.get('fechaFin')!.setValue(this.toInputDate(fin));
      }
    });

    // Recalcular fecha_fin cuando cambia fecha_inicio
    this.formFactura.get('fechaInicio')!.valueChanges.subscribe(fecha => {
      const idPlan = this.formFactura.get('idPlan')!.value;
      const plan = this.planes.find(p => p.idPlan === idPlan);
      if (plan && fecha) {
        const inicio = new Date(fecha);
        const fin = new Date(inicio.getTime() + plan.duracion * 24 * 60 * 60 * 1000);
        this.formFactura.get('fechaFin')!.setValue(this.toInputDate(fin), { emitEvent: false });
      }
    });
  }

  get planSeleccionado(): Plan | undefined {
    return this.planes.find(p => p.idPlan === this.formFactura.get('idPlan')?.value);
  }

  siguientePaso(): void {
    if (this.formCliente.valid) this.paso = 2;
  }

  pasoAnterior(): void {
    this.paso = 1;
  }

  guardar(): void {
    if (this.formCliente.invalid || this.formFactura.invalid) return;
    this.guardando = true;

    const clienteData = this.formCliente.value;
    const facturaData = this.formFactura.value;

    // Paso 1: crear cliente
    this.clienteService.create(clienteData).subscribe({
      next: (clienteCreado) => {
        // Paso 2: crear factura vinculada al cliente
        const factura: any = {
          tipo: 'MENSUALIDAD',
          cliente:    { cc: clienteCreado.cc },
          plan:       { idPlan: facturaData.idPlan },
          vendedor:   { cc: facturaData.ccVendedor },
          metodoPago: facturaData.metodoPago,
          fechaInicio: facturaData.fechaInicio || null,
          fechaFin:    facturaData.fechaFin    || null,
          detalles: [{
            descripcion: `Mensualidad - ${this.planSeleccionado?.nombre ?? ''}`,
            valorPagado: this.planSeleccionado?.precio ?? 0
          }]
        };

        this.facturaService.create(factura).subscribe({
          next: () => {
            this.snackBar.open(
              `Cliente ${clienteCreado.nombre1} registrado con su plan correctamente`,
              'Cerrar', { duration: 3000 }
            );
            this.ref.close(true);
          },
          error: (e) => {
            // Cliente ya fue creado, solo falló la factura
            this.snackBar.open(
              `Cliente creado pero error en factura: ${e.error?.mensaje ?? 'Error desconocido'}`,
              'Cerrar', { duration: 5000 }
            );
            this.guardando = false;
            this.ref.close(true); // Cerramos igual para que recargue la lista
          }
        });
      },
      error: (e) => {
        this.snackBar.open(
          e.error?.mensaje ?? 'Error al crear el cliente',
          'Cerrar', { duration: 4000 }
        );
        this.guardando = false;
      }
    });
  }

  cancelar(): void { this.ref.close(false); }

  private toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
