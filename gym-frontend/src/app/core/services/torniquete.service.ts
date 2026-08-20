import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type EstadoTorniquete = 'CONECTADO' | 'DESCONECTADO' | 'VERIFICANDO';

export interface ResultadoApertura {
  exito:   boolean;
  mensaje: string;
}

interface TorniqueteBackendResponse {
  exito:   boolean;
  mensaje: string;
  estado:  string;
}

@Injectable({ providedIn: 'root' })
export class TorniqueteService {

  private url = `${environment.apiUrl}/torniquete`;

  constructor(private http: HttpClient) {}

  // El backend verifica la conexión con el Dahua
  verificarConexion(): Observable<EstadoTorniquete> {
    return this.http.get<TorniqueteBackendResponse>(`${this.url}/estado`).pipe(
      map(r => r.estado === 'CONECTADO' ? 'CONECTADO' : 'DESCONECTADO'),
      catchError(() => of<EstadoTorniquete>('DESCONECTADO'))
    );
  }

  // El backend envía el comando de apertura al Dahua
  abrirTorniquete(): Observable<ResultadoApertura> {
    return this.http.post<TorniqueteBackendResponse>(`${this.url}/abrir`, {}).pipe(
      map(r => ({ exito: r.exito, mensaje: r.mensaje })),
      catchError(e => of<ResultadoApertura>({
        exito: false,
        mensaje: 'Error de conexión con el servidor'
      }))
    );
  }

  registrarAcceso(cc: number, permitido: boolean): Observable<ResultadoApertura> {
    if (!permitido) {
      return of<ResultadoApertura>({
        exito:   false,
        mensaje: 'Acceso denegado — membresía vencida o sin plan'
      });
    }
    return this.abrirTorniquete();
  }

  // Ya no necesitamos saber si es simulado desde el frontend
  get modoSimulado(): boolean { return false; }
}
