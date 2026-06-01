package com.gimnasio.model;

import com.gimnasio.model.enums.TipoFactura;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = true)
    private Plan plan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_cc", nullable = true)
    private Cliente cliente;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cc_vendedor", nullable = false)
    private Vendedor vendedor;

    @Size(max = 20)
    @Column(name = "metodo_pago", length = 20)
    private String metodoPago;

    @Column(name = "fecha_factura")
    private LocalDate fechaFactura;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoFactura tipo;

    // EAGER para que los detalles siempre estén disponibles al serializar
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DetalleFactura> detalles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.fechaFactura == null) {
            this.fechaFactura = LocalDate.now();
        }
    }
}
