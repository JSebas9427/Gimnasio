import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-CO';

import { MatCardModule }            from '@angular/material/card';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatTableModule }           from '@angular/material/table';
import { MatTabsModule }            from '@angular/material/tabs';
import { MatSnackBarModule }        from '@angular/material/snack-bar';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { MatDividerModule }         from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule }      from '@angular/material/datepicker';
import { MatNativeDateModule }      from '@angular/material/core';
import { MatSelectModule }          from '@angular/material/select';

registerLocaleData(localeEs);

@NgModule({
  declarations: [ReportesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportesRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' }
  ]
})
export class ReportesModule { }
