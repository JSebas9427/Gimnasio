package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO liviano para la lista de clientes con estado calculado.
 * No incluye historial de facturas para que la lista cargue rápido.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResumenDTO {
    private Integer cc;
    private String  nombreCompleto;
    private String  telefono;
    private String  correo;
    private LocalDateTime fechaRegistro;

    // Estado calculado
    private String    estado;         // ACTIVO | AGOTADO | SIN_PLAN
    private LocalDate ultimaFechaFin;
    private String    ultimoPlan;
    private Integer   diasRestantes;
}
