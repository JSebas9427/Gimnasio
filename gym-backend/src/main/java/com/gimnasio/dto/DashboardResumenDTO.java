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
public class DashboardResumenDTO {

    // ── Financiero del día ────────────────────────────────────────────────
    private BigDecimal ingresosHoy;
    private Long       facturasHoy;
    private BigDecimal ingresosSemana;

    // ── Membresías ────────────────────────────────────────────────────────
    private Long totalClientes;
    private Long clientesActivos;
    private Long clientesAgotados;
    private Long clientesSinPlan;

    // ── Alertas ───────────────────────────────────────────────────────────
    private Long clientesVencenHoy;
    private Long clientesVencen3Dias;
    private Long clientesVencen7Dias;
}
