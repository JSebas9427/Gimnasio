package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccesoDTO {
    private Integer   idAcceso;
    private Integer   cc;
    private String    tipoPersona;
    private String    nombre;
    private String    estadoAcceso;
    private String    motivoDenegacion;
    private String    metodo;
    private LocalDate fechaAcceso;
    private LocalTime horaAcceso;
}
