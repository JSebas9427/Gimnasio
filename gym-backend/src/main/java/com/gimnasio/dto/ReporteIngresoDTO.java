package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteIngresoDTO {

    private Integer idFactura;
    private LocalDate fechaFactura;
    private String tipo;
    private String metodoPago;
    private BigDecimal valor;

    // Datos del cliente (nullable en diario)
    private Integer clienteCc;
    private String clienteNombre;

    // Datos del vendedor
    private Integer vendedorCc;
    private String vendedorNombre;

    // Plan (nullable en diario)
    private String planNombre;
}
