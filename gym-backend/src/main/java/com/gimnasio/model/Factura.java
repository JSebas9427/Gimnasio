package com.gimnasio.model;

import com.gimnasio.model.enums.TipoFactura;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Integer idFactura;

    // nullable → solo mensualidad tiene plan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = true)
    private Plan plan;

    // nullable → entreno diario no requiere cliente identificado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_cc", nullable = true)
    private Cliente cliente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cc_vendedor", nullable = false)
    private Vendedor vendedor;

    @Size(max = 20)
    @Column(name = "metodo_pago", length = 20)
    private String metodoPago;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    // nullable → solo mensualidad tiene fecha fin
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoFactura tipo;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleFactura> detalles;
}
