package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenAccesosDiaDTO {
    private Long totalHoy;
    private Long permitidosHoy;
    private Long denegadosHoy;
    private Long clientesHoy;
    private Long empleadosHoy;
}
