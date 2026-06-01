import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FacturasRoutingModule } from './facturas-routing.module';
import { ListaFacturasComponent } from './lista-facturas/lista-facturas.component';
import { FormFacturaComponent } from './form-factura/form-factura.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [ListaFacturasComponent, FormFacturaComponent],
  imports: [
    CommonModule, ReactiveFormsModule, FacturasRoutingModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule,
    MatDialogModule, MatSnackBarModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule, MatChipsModule
  ]
})
export class FacturasModule { }
