import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/models';
import { hoy, parseApiDate, toApiDate } from '../../../core/utils/fechas';

@Component({
  selector: 'app-form-cliente',
  templateUrl: './form-cliente.component.html',
  styleUrls: ['./form-cliente.component.scss']
})
export class FormClienteComponent implements OnInit {

  form!: FormGroup;
  esEdicion = false;
  hoy = hoy();
  // El calendario de nacimiento arranca ~25 años atrás para no recorrer desde hoy
  inicioCalendario = new Date(this.hoy.getFullYear() - 25, 0, 1);

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    private snackBar: MatSnackBar,
    private ref: MatDialogRef<FormClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      cc:               [{ value: this.data?.cc ?? '', disabled: this.esEdicion }, Validators.required],
      nombre1:          [this.data?.nombre1   ?? '', [Validators.required, Validators.maxLength(20)]],
      nombre2:          [this.data?.nombre2   ?? '', Validators.maxLength(20)],
      apellido1:        [this.data?.apellido1 ?? '', [Validators.required, Validators.maxLength(20)]],
      apellido2:        [this.data?.apellido2 ?? '', Validators.maxLength(20)],
      fechaNacimiento:  [parseApiDate(this.data?.fechaNacimiento)],
      telefono:         [this.data?.telefono  ?? '', Validators.maxLength(10)],
      correo:           [this.data?.correo    ?? '', [Validators.email, Validators.maxLength(50)]]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const v: Cliente = { ...raw, fechaNacimiento: toApiDate(raw.fechaNacimiento) ?? undefined };
    const op = this.esEdicion
      ? this.service.update(this.data!.cc, v)
      : this.service.create(v);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Cliente ${this.esEdicion ? 'actualizado' : 'registrado'}`, 'Cerrar', { duration: 2000 });
        this.ref.close(true);
      },
      error: (e) => this.snackBar.open(e.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 })
    });
  }

  cancelar(): void { this.ref.close(false); }
}
