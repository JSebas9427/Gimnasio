package com.gimnasio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "plan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plan")
    private Integer idPlan;

    @NotBlank
    @Size(max = 20)
    @Column(name = "nombre", nullable = false, length = 20)
    private String nombre;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @NotNull
    @Min(1)
    @Column(name = "duracion", nullable = false)
    private Integer duracion; // en días

    @Size(max = 100)
    @Column(name = "descripcion", length = 100)
    private String descripcion;
}
