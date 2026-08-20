package com.gimnasio.dto;

import lombok.Data;

@Data
public class RegistrarAccesoRequestDTO {
    private Integer cc;
    private String  tipoPersona;    // CLIENTE | EMPLEADO
    private String  nombre;
    private String  estadoAcceso;   // PERMITIDO | DENEGADO
    private String  motivoDenegacion;
    private String  metodo;         // CC_MANUAL | FACIAL | TARJETA
}
