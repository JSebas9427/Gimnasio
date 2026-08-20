package com.gimnasio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TorniqueteResponseDTO {
    private boolean exito;
    private String  mensaje;
    private String  estado;   // CONECTADO | DESCONECTADO
}
