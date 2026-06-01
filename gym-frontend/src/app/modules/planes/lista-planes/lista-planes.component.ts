import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanService } from '../../../core/services/plan.service';
import { Plan } from '../../../core/models/models';
import { FormPlanComponent } from '../form-plan/form-plan.component';

@Component({
  selector: 'app-lista-planes',
  templateUrl: './lista-planes.component.html',
  styleUrls: ['./lista-planes.component.scss']
})
export class ListaPlanesComponent implements OnInit {

  planes: Plan[] = [];
  columnas = ['nombre', 'precio', 'duracion', 'descripcion', 'acciones'];
  cargando = false;

  constructor(
    private planService: PlanService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.planService.getAll().subscribe({
      next: (data) => { this.planes = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar planes'); this.cargando = false; }
    });
  }

  abrirFormulario(plan?: Plan): void {
    const ref = this.dialog.open(FormPlanComponent, {
      width: '480px',
      data: plan ?? null
    });

    ref.afterClosed().subscribe(resultado => {
      if (resultado) this.cargarPlanes();
    });
  }

  eliminar(plan: Plan): void {
    if (!confirm(`¿Eliminar el plan "${plan.nombre}"?`)) return;
    this.planService.delete(plan.idPlan!).subscribe({
      next: () => { this.mostrarMensaje('Plan eliminado'); this.cargarPlanes(); },
      error: () => this.mostrarMensaje('Error al eliminar el plan')
    });
  }

  mostrarMensaje(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
  }
}
