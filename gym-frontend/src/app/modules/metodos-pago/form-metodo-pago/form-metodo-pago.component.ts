import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { MetodoPago } from '../../../core/models/models';

@Component({
  selector: 'app-form-metodo-pago',
  templateUrl: './form-metodo-pago.component.html',
  styleUrls: ['./form-metodo-pago.component.scss']
})
export class FormMetodoPagoComponent implements OnInit {

  form!: FormGroup;
  esEdicion = false;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private service: MetodoPagoService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<FormMetodoPagoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MetodoPago | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      nombre:      [this.data?.nombre ?? '', [Validators.required, Validators.maxLength(20)]],
      descripcion: [this.data?.descripcion ?? '', Validators.maxLength(100)],
      activo:      [this.data?.activo ?? true],
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) return;
    this.guardando = true;
    const v = this.form.value;
    const metodo: MetodoPago = {
      nombre:      String(v.nombre).trim().toUpperCase(),
      descripcion: v.descripcion || undefined,
      activo:      v.activo,
    };
    const op = this.esEdicion
      ? this.service.update(this.data!.idMetodoPago!, metodo)
      : this.service.create(metodo);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Método de pago ${this.esEdicion ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 2000 });
        this.ref.close(true);
      },
      error: e => {
        this.guardando = false;
        this.snackBar.open(e.error?.mensaje ?? 'Error al guardar', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cancelar(): void { this.ref.close(false); }
}
