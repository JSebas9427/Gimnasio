import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';

// Adaptador del calendario (mat-datepicker) en formato colombiano dd/MM/yyyy,
// semana iniciando en lunes y que acepta fechas escritas a mano (29/09/2026, 29-9-26...).
@Injectable()
export class EsDateAdapter extends NativeDateAdapter {

  override getFirstDayOfWeek(): number { return 1; }

  override parse(value: any, parseFormat?: any): Date | null {
    if (typeof value === 'string') {
      const txt = value.trim();
      if (!txt) return null;
      const m = txt.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
      if (m) {
        const dia = Number(m[1]);
        const mes = Number(m[2]) - 1;
        let anio = Number(m[3]);
        if (anio < 100) anio += 2000;
        const fecha = new Date(anio, mes, dia);
        // Descarta fechas imposibles como 31/02
        return fecha.getMonth() === mes ? fecha : this.invalid();
      }
      return this.invalid();
    }
    return super.parse(value, parseFormat);
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      return `${d}/${m}/${date.getFullYear()}`;
    }
    return super.format(date, displayFormat);
  }
}

export const ES_DATE_FORMATS: MatDateFormats = {
  parse:   { dateInput: 'input' },
  display: {
    dateInput:          'input',
    monthYearLabel:     { year: 'numeric', month: 'short' },
    dateA11yLabel:      { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};
