import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

export type EstadoTorniquete = 'CONECTADO' | 'DESCONECTADO' | 'VERIFICANDO';

export interface ResultadoApertura {
  exito: boolean;
  mensaje: string;
}

/**
 * TorniqueteService — capa de abstracción para el control del torniquete Dahua.
 *
 * MODO SIMULADO (environment.torniqueteSimulado = true):
 *   - Estado: siempre CONECTADO (simulado)
 *   - Apertura: simula delay de 800ms y devuelve éxito
 *
 * MODO REAL (environment.torniqueteSimulado = false):
 *   - Estado: ping HTTP al dispositivo Dahua en la red local
 *   - Apertura: POST al endpoint ISAPI del Dahua
 *
 * Para pasar a modo real cuando el dispositivo esté conectado:
 *   1. Conectar el Dahua a la red local
 *   2. Cambiar environment.torniqueteSimulado = false
 *   3. Configurar ip, puerto, usuario y password en environment.torniquete
 */
@Injectable({ providedIn: 'root' })
export class TorniqueteService {

  private readonly simulado = environment.torniqueteSimulado;
  private readonly config   = environment.torniquete;

  // ── Estado de conexión ─────────────────────────────────────────────────

  verificarConexion(): Observable<EstadoTorniquete> {
    if (this.simulado) {
      // En modo simulado siempre está "conectado"
      return of<EstadoTorniquete>('CONECTADO').pipe(delay(300));
    }

    // TODO (modo real): hacer GET al Dahua y verificar respuesta
    // return this.http.get(`http://${this.config.ip}/ISAPI/System/status`)
    //   .pipe(
    //     map(() => 'CONECTADO' as EstadoTorniquete),
    //     catchError(() => of('DESCONECTADO' as EstadoTorniquete))
    //   );

    return of<EstadoTorniquete>('DESCONECTADO').pipe(delay(300));
  }

  // ── Apertura manual ────────────────────────────────────────────────────

  abrirTorniquete(): Observable<ResultadoApertura> {
    if (this.simulado) {
      return of<ResultadoApertura>({
        exito:   true,
        mensaje: '✅ Torniquete abierto (modo simulado)'
      }).pipe(delay(800));
    }

    // TODO (modo real): POST al endpoint ISAPI del Dahua
    // return this.http.post(
    //   `http://${this.config.ip}/ISAPI/AccessControl/RemoteControl/door/${this.config.canal}`,
    //   '<RemoteControlDoor><cmd>open</cmd></RemoteControlDoor>',
    //   { headers: { 'Content-Type': 'application/xml' } }
    // ).pipe(
    //   map(() => ({ exito: true, mensaje: 'Torniquete abierto correctamente' })),
    //   catchError(e => of({ exito: false, mensaje: 'Error al abrir: ' + e.message }))
    // );

    return of<ResultadoApertura>({
      exito:   false,
      mensaje: '❌ Torniquete no conectado'
    }).pipe(delay(800));
  }

  // ── Acceso por cliente ─────────────────────────────────────────────────

  registrarAcceso(cc: number, permitido: boolean): Observable<ResultadoApertura> {
    if (!permitido) {
      return of<ResultadoApertura>({
        exito:   false,
        mensaje: 'Acceso denegado — membresía vencida o sin plan'
      });
    }
    return this.abrirTorniquete();
  }

  get modoSimulado(): boolean { return this.simulado; }
}
