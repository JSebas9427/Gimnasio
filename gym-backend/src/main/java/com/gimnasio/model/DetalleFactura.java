package com.gimnasio.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleFactura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_factura")
    private Integer idDetalleFactura;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_factura", nullable = false)
    private Factura factura;

    @Size(max = 200)
    @Column(name = "descripcion", length = 200)
    private String descripcion;

    // Precio del plan en el momento de la factura (referencia histórica)
    @Column(name = "valor_esperado", precision = 10, scale = 2)
    private BigDecimal valorEsperado;

    // Lo que realmente pagó el cliente (editable)
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "valor_pagado", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorPagado;
}
