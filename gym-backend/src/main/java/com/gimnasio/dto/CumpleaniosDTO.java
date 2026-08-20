package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CumpleaniosDTO {
    private Integer cc;
    private String  nombreCompleto;
    private String  telefono;
    private Integer dia;
    private Integer mes;
    private Integer edad;
    private Boolean esHoy;
}
