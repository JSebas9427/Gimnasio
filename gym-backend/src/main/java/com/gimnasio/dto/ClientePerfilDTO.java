package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientePerfilDTO {

    // ── Datos personales ──────────────────────────────────────────────────
    private Integer cc;
    private String  nombre1;
    private String  nombre2;
    private String  apellido1;
    private String  apellido2;
    private String  nombreCompleto;
    private String  telefono;
    private String  correo;
    private LocalDateTime fechaRegistro;

    // ── Estado de membresía ───────────────────────────────────────────────
    private String     estado;        // ACTIVO | AGOTADO | SIN_PLAN
    private LocalDate  ultimaFechaFin;
    private String     ultimoPlan;
    private Integer    diasRestantes; // positivo = días que quedan, negativo = días vencido

    // ── Historial de facturas ─────────────────────────────────────────────
    private List<FacturaResponseDTO> facturas;
}
