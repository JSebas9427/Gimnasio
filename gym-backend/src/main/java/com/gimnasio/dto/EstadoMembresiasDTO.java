package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadoMembresiasDTO {
    private Long activos;
    private Long agotados;
    private Long sinPlan;
    private Long total;
    private Double porcentajeActivos;
    private Double porcentajeAgotados;
    private Double porcentajeSinPlan;
}
