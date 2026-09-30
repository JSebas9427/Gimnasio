import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FacturasRoutingModule } from './facturas-routing.module';
import { ListaFacturasComponent } from './lista-facturas/lista-facturas.component';
import { FormFacturaComponent } from './form-factura/form-factura.component';
import { DetalleFacturaComponent } from './detalle-factura/detalle-factura.component';

import { MatTableModule }           from '@angular/material/table';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatCardModule }            from '@angular/material/card';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatSelectModule }          from '@angular/material/select';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule }           from '@angular/material/chips';
import { RouterModule }             from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule }      from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';


@NgModule({
  declarations: [ListaFacturasComponent, FormFacturaComponent, DetalleFacturaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FacturasRoutingModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
  ]
})
export class FacturasModule { }
