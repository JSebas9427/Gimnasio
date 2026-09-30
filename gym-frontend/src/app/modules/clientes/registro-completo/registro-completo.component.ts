import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { FacturaService } from '../../../core/services/factura.service';
import { PlanService } from '../../../core/services/plan.service';
import { VendedorService } from '../../../core/services/vendedor.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { NavegacionService } from '../../../core/services/navegacion.service';
import { Plan, Vendedor } from '../../../core/models/models';
import { hoy, sumarDias, toApiDate } from '../../../core/utils/fechas';

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
  metodosPago: string[] = [];

  paso = 1; // 1 = datos cliente, 2 = datos factura
  guardando = false;

  hoy = hoy();
  inicioCalendarioNacimiento = new Date(this.hoy.getFullYear() - 25, 0, 1);

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private facturaService: FacturaService,
    private planService: PlanService,
    private vendedorService: VendedorService,
    private metodoPagoService: MetodoPagoService,
    private navegacion: NavegacionService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<RegistroCompletoComponent>
  ) {}

  ngOnInit(): void {
    this.planService.getAll().subscribe(d => this.planes = d);
    this.vendedorService.getAll().subscribe(d => this.vendedores = d);
    this.metodoPagoService.getActivos().subscribe(d => {
      this.metodosPago = d.map(m => m.nombre);
      if (this.metodosPago.length) {
        const porDefecto = this.metodosPago.includes('EFECTIVO') ? 'EFECTIVO' : this.metodosPago[0];
        this.formFactura.get('metodoPago')!.setValue(porDefecto);
      }
    });

    this.formCliente = this.fb.group({
      cc:        ['', [Validators.required]],
      nombre1:   ['', [Validators.required, Validators.maxLength(20)]],
      nombre2:   ['', Validators.maxLength(20)],
      apellido1: ['', [Validators.required, Validators.maxLength(20)]],
      apellido2: ['', Validators.maxLength(20)],
      telefono:  ['', Validators.maxLength(10)],
      correo:    ['', [Validators.email, Validators.maxLength(50)]],
      fechaNacimiento: [null]
    });

    this.formFactura = this.fb.group({
      idPlan:      ['', Validators.required],
      ccVendedor:  ['', Validators.required],
      metodoPago:  ['', Validators.required],
      fechaInicio: [this.hoy],
      fechaFin:    [sumarDias(this.hoy, 30)]
    });

    // Recalcular fecha_fin cuando cambia el plan o la fecha de inicio
    this.formFactura.get('idPlan')!.valueChanges.subscribe(() => this.recalcularFechaFin());
    this.formFactura.get('fechaInicio')!.valueChanges.subscribe(() => this.recalcularFechaFin());
  }

  private recalcularFechaFin(): void {
    const plan = this.planSeleccionado;
    const inicio: Date | null = this.formFactura.get('fechaInicio')!.value;
    if (plan && inicio) {
      this.formFactura.get('fechaFin')!.setValue(sumarDias(inicio, plan.duracion), { emitEvent: false });
    }
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

    const clienteData = {
      ...this.formCliente.value,
      fechaNacimiento: toApiDate(this.formCliente.value.fechaNacimiento)
    };
    const facturaData = this.formFactura.value;

    // Se reserva la pestaña en el clic para abrir luego la factura sin que el navegador la bloquee
    const pestana = this.navegacion.reservarPestana();

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
          fechaInicio: toApiDate(facturaData.fechaInicio),
          fechaFin:    toApiDate(facturaData.fechaFin),
          detalles: [{
            descripcion: `Mensualidad - ${this.planSeleccionado?.nombre ?? ''}`,
            valorPagado: this.planSeleccionado?.precio ?? 0
          }]
        };

        this.facturaService.create(factura).subscribe({
          next: (guardada) => {
            this.snackBar.open(
              `Cliente ${clienteCreado.nombre1} registrado con su plan correctamente`,
              'Cerrar', { duration: 3000 }
            );
            if (guardada?.idFactura) pestana.abrir(['/facturas', guardada.idFactura]);
            else pestana.cerrar();
            this.ref.close(true);
          },
          error: (e) => {
            pestana.cerrar();
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
        pestana.cerrar();
        this.snackBar.open(
          e.error?.mensaje ?? 'Error al crear el cliente',
          'Cerrar', { duration: 4000 }
        );
        this.guardando = false;
      }
    });
  }

  cancelar(): void { this.ref.close(false); }
}
