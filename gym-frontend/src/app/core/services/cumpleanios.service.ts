import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CumpleaniosDTO {
  cc:             number;
  nombreCompleto: string;
  telefono:       string;
  dia:            number;
  mes:            number;
  edad:           number;
  esHoy:          boolean;
}

@Injectable({ providedIn: 'root' })
export class CumpleaniosService {
  private url = `${environment.apiUrl}/cumpleanios`;
  constructor(private http: HttpClient) {}

  getMes():  Observable<CumpleaniosDTO[]> { return this.http.get<CumpleaniosDTO[]>(`${this.url}/mes`);  }
  getHoy():  Observable<CumpleaniosDTO[]> { return this.http.get<CumpleaniosDTO[]>(`${this.url}/hoy`);  }
}
