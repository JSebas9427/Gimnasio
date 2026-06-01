package com.gimnasio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @Column(name = "CC", length = 10)
    private Integer cc;

    @NotBlank
    @Size(max = 20)
    @Column(name = "nombre_1", nullable = false, length = 20)
    private String nombre1;

    @Size(max = 20)
    @Column(name = "nombre_2", length = 20)
    private String nombre2;

    @NotBlank
    @Size(max = 20)
    @Column(name = "apellido_1", nullable = false, length = 20)
    private String apellido1;

    @Size(max = 20)
    @Column(name = "apellido_2", length = 20)
    private String apellido2;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Size(max = 10)
    @Column(name = "telefono", length = 10)
    private String telefono;

    @Email
    @Size(max = 50)                         // ← ajustado a 50
    @Column(name = "correo", length = 50)   // ← ajustado a 50
    private String correo;

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}
