package com.gimnasio.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "acceso")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Acceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acceso")
    private Integer idAcceso;

    // nullable — empleados y diarios también pueden registrarse
    @Column(name = "cc")
    private Integer cc;

    @Column(name = "tipo_persona", nullable = false, length = 10)
    private String tipoPersona;       // CLIENTE | EMPLEADO

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "estado_acceso", nullable = false, length = 10)
    private String estadoAcceso;      // PERMITIDO | DENEGADO

    @Column(name = "motivo_denegacion", length = 100)
    private String motivoDenegacion;

    @Column(name = "metodo", nullable = false, length = 30)
    private String metodo;            // CC_MANUAL | FACIAL | TARJETA

    @Column(name = "fecha_acceso", nullable = false)
    private LocalDate fechaAcceso;

    @Column(name = "hora_acceso", nullable = false)
    private LocalTime horaAcceso;

    @PrePersist
    public void prePersist() {
        if (this.fechaAcceso == null) this.fechaAcceso = LocalDate.now();
        if (this.horaAcceso  == null) this.horaAcceso  = LocalTime.now();
        if (this.metodo      == null) this.metodo       = "CC_MANUAL";
    }
}
