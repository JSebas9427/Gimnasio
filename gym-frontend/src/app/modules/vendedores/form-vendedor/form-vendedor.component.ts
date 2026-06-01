import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VendedorService } from '../../../core/services/vendedor.service';
import { Vendedor } from '../../../core/models/models';

@Component({ selector: 'app-form-vendedor', templateUrl: './form-vendedor.component.html' })
export class FormVendedorComponent implements OnInit {
  form!: FormGroup;
  esEdicion = false;

  constructor(private fb: FormBuilder, private service: VendedorService, private snackBar: MatSnackBar,
    private ref: MatDialogRef<FormVendedorComponent>, @Inject(MAT_DIALOG_DATA) public data: Vendedor | null) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      cc:        [{ value: this.data?.cc ?? '', disabled: this.esEdicion }, Validators.required],
      nombre1:   [this.data?.nombre1   ?? '', [Validators.required, Validators.maxLength(20)]],
      nombre2:   [this.data?.nombre2   ?? '', Validators.maxLength(20)],
      apellido1: [this.data?.apellido1 ?? '', [Validators.required, Validators.maxLength(20)]],
      apellido2: [this.data?.apellido2 ?? '', Validators.maxLength(20)],
      cargo:     [this.data?.cargo     ?? '', Validators.maxLength(20)],
      telefono:  [this.data?.telefono  ?? '', Validators.maxLength(10)],
      correo:    [this.data?.correo    ?? '', [Validators.email, Validators.maxLength(20)]]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v: Vendedor = { ...this.form.getRawValue() };
    const op = this.esEdicion ? this.service.update(this.data!.cc, v) : this.service.create(v);
    op.subscribe({
      next: () => { this.snackBar.open(`Vendedor ${this.esEdicion?'actualizado':'creado'}`, 'Cerrar', {duration:2000}); this.ref.close(true); },
      error: (e) => this.snackBar.open(e.error?.mensaje ?? 'Error', 'Cerrar', {duration:3000})
    });
  }

  cancelar(): void { this.ref.close(false); }
}
