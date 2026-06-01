import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/models';

@Component({ selector: 'app-form-cliente', templateUrl: './form-cliente.component.html' })
export class FormClienteComponent implements OnInit {

  form!: FormGroup;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FormClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      cc:        [{ value: this.data?.cc ?? '', disabled: this.esEdicion }, [Validators.required]],
      nombre1:   [this.data?.nombre1   ?? '', [Validators.required, Validators.maxLength(20)]],
      nombre2:   [this.data?.nombre2   ?? '', Validators.maxLength(20)],
      apellido1: [this.data?.apellido1 ?? '', [Validators.required, Validators.maxLength(20)]],
      apellido2: [this.data?.apellido2 ?? '', Validators.maxLength(20)],
      telefono:  [this.data?.telefono  ?? '', Validators.maxLength(10)],
      correo:    [this.data?.correo    ?? '', [Validators.email, Validators.maxLength(20)]]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const cliente: Cliente = { ...this.form.getRawValue() };

    const op = this.esEdicion
      ? this.clienteService.update(this.data!.cc, cliente)
      : this.clienteService.create(cliente);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Cliente ${this.esEdicion ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => this.snackBar.open(err.error?.mensaje ?? 'Error', 'Cerrar', { duration: 3000 })
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
}
