package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Agrupa ingresos por día — usado para la gráfica de barras semanal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteIngresoDiaDTO {
    private LocalDate fecha;
    private BigDecimal totalDia;
    private Long cantidadFacturas;
}
