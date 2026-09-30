package com.gimnasio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "metodo_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metodo_pago")
    private Integer idMetodoPago;

    // Se guarda tal cual en factura.metodo_pago (VARCHAR 20), por eso el mismo límite
    @NotBlank
    @Size(max = 20)
    @Column(name = "nombre", nullable = false, length = 20, unique = true)
    private String nombre;

    @Size(max = 100)
    @Column(name = "descripcion", length = 100)
    private String descripcion;

    // Los inactivos no aparecen al crear facturas, pero se conservan en el historial
    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @PrePersist
    public void prePersist() {
        if (this.activo == null) this.activo = true;
    }
}
