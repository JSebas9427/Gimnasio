package com.gimnasio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "vendedor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendedor {

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

    @Size(max = 20)
    @Column(name = "cargo", length = 20)
    private String cargo;

    @Size(max = 10)
    @Column(name = "telefono", length = 10)
    private String telefono;

    @Email
    @Size(max = 20)
    @Column(name = "correo", length = 20)
    private String correo;
}
