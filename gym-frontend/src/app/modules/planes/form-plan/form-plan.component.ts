import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanService } from '../../../core/services/plan.service';
import { Plan } from '../../../core/models/models';

@Component({
  selector: 'app-form-plan',
  templateUrl: './form-plan.component.html'
})
export class FormPlanComponent implements OnInit {

  form!: FormGroup;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<FormPlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Plan | null
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.data;
    this.form = this.fb.group({
      nombre:      [this.data?.nombre      ?? '', [Validators.required, Validators.maxLength(20)]],
      precio:      [this.data?.precio      ?? '', [Validators.required, Validators.min(0)]],
      duracion:    [this.data?.duracion    ?? '', [Validators.required, Validators.min(1)]],
      descripcion: [this.data?.descripcion ?? '', Validators.maxLength(100)]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const plan: Plan = this.form.value;

    const op = this.esEdicion
      ? this.planService.update(this.data!.idPlan!, plan)
      : this.planService.create(plan);

    op.subscribe({
      next: () => {
        this.snackBar.open(`Plan ${this.esEdicion ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => this.snackBar.open(err.error?.mensaje ?? 'Error al guardar', 'Cerrar', { duration: 3000 })
    });
  }

  cancelar(): void { this.dialogRef.close(false); }
}
