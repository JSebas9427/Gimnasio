import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccesoDTO {
  idAcceso:         number;
  cc:               number | null;
  tipoPersona:      'CLIENTE' | 'EMPLEADO';
  nombre:           string;
  estadoAcceso:     'PERMITIDO' | 'DENEGADO';
  motivoDenegacion: string | null;
  metodo:           string;
  fechaAcceso:      string;
  horaAcceso:       string;
}

export interface RegistrarAccesoRequest {
  cc:               number | null;
  tipoPersona:      string;
  nombre:           string;
  estadoAcceso:     string;
  motivoDenegacion: string | null;
  metodo:           string;
}

export interface ResumenAccesosDiaDTO {
  totalHoy:       number;
  permitidosHoy:  number;
  denegadosHoy:   number;
  clientesHoy:    number;
  empleadosHoy:   number;
}

@Injectable({ providedIn: 'root' })
export class AccesoService {
  private url = `${environment.apiUrl}/accesos`;

  constructor(private http: HttpClient) {}

  registrar(req: RegistrarAccesoRequest): Observable<AccesoDTO> {
    return this.http.post<AccesoDTO>(this.url, req);
  }

  getHoy(): Observable<AccesoDTO[]> {
    return this.http.get<AccesoDTO[]>(`${this.url}/hoy`);
  }

  getResumenHoy(): Observable<ResumenAccesosDiaDTO> {
    return this.http.get<ResumenAccesosDiaDTO>(`${this.url}/resumen-hoy`);
  }

  getPorRango(inicio: string, fin: string): Observable<AccesoDTO[]> {
    const params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<AccesoDTO[]>(this.url, { params });
  }

  getPorCliente(cc: number): Observable<AccesoDTO[]> {
    return this.http.get<AccesoDTO[]>(`${this.url}/cliente/${cc}`);
  }
}
