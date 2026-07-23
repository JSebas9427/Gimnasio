package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteProximoVencerDTO {
    private Integer   cc;
    private String    nombreCompleto;
    private String    telefono;
    private String    planNombre;
    private LocalDate fechaFin;
    private Integer   diasRestantes;
}
