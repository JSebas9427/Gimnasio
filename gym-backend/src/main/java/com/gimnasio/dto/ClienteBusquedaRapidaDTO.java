package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteBusquedaRapidaDTO {

    private Integer   cc;
    private String    nombreCompleto;
    private String    telefono;

    // CLIENTE | EMPLEADO
    private String    tipoPersona;

    // Solo aplica a clientes
    private String    estado;           // ACTIVO | AGOTADO | SIN_PLAN
    private String    planNombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer   diasRestantes;

    // Solo aplica a empleados
    private String    cargo;

    // Resultado final
    private Boolean   accesoPermitido;
    private String    motivoDenegacion;
}
