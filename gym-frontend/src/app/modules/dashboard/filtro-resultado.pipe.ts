import { Pipe, PipeTransform } from '@angular/core';
import { RegistroAcceso } from '../../core/services/torniquete.service';

@Pipe({ name: 'filtroResultado' })
export class FiltroResultadoPipe implements PipeTransform {
  transform(accesos: RegistroAcceso[], resultado: 'PERMITIDO' | 'DENEGADO'): number {
    return accesos.filter(a => a.resultado === resultado).length;
  }
}
