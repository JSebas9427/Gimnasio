package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteClienteNuevoDTO {
    private Integer cc;
    private String nombreCompleto;
    private String telefono;
    private String correo;
    private LocalDateTime fechaRegistro;
    // Plan con el que se registró (puede ser null si fue solo cliente)
    private String planNombre;
}
