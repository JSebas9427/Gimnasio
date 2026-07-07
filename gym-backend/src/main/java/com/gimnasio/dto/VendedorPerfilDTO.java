package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendedorPerfilDTO {

    // ── Datos personales ──────────────────────────────────────────────────
    private Integer cc;
    private String  nombre1;
    private String  nombre2;
    private String  apellido1;
    private String  apellido2;
    private String  nombreCompleto;
    private String  cargo;
    private String  telefono;
    private String  correo;

    // ── Resumen del período ───────────────────────────────────────────────
    private Long       totalFacturas;
    private Long       totalMensualidades;
    private Long       totalDiarios;
    private BigDecimal totalIngresos;

    // ── Facturas del período ──────────────────────────────────────────────
    private List<FacturaResponseDTO> facturas;
}
