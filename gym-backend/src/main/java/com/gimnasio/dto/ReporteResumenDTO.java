package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResumenDTO {

    // ── Ingresos ──────────────────────────────────────────────────────────
    private BigDecimal totalIngresos;
    private BigDecimal totalMensualidades;
    private BigDecimal totalDiarios;

    // ── Conteos ───────────────────────────────────────────────────────────
    private Long cantidadFacturas;
    private Long cantidadMensualidades;
    private Long cantidadDiarios;
    private Long clientesNuevos;

    // ── Por método de pago ────────────────────────────────────────────────
    private BigDecimal totalEfectivo;
    private BigDecimal totalTarjeta;
    private BigDecimal totalTransferencia;
    private BigDecimal totalNequi;
}
