package com.gimnasio.dto;

import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class FacturaResponseDTO {

    private Integer idFactura;
    private TipoFactura tipo;
    private String metodoPago;
    private LocalDate fechaFactura;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private ClienteDTO cliente;
    private VendedorDTO vendedor;
    private PlanDTO plan;
    private List<DetalleDTO> detalles;

    @Data
    public static class ClienteDTO {
        private Integer cc;
        private String nombre1;
        private String apellido1;
    }

    @Data
    public static class VendedorDTO {
        private Integer cc;
        private String nombre1;
        private String apellido1;
    }

    @Data
    public static class PlanDTO {
        private Integer idPlan;
        private String nombre;
        private BigDecimal precio;
    }

    @Data
    public static class DetalleDTO {
        private Integer idDetalleFactura;
        private String descripcion;
        private BigDecimal valorPagado;
    }

    public static FacturaResponseDTO from(Factura f) {
        FacturaResponseDTO dto = new FacturaResponseDTO();
        dto.setIdFactura(f.getIdFactura());
        dto.setTipo(f.getTipo());
        dto.setMetodoPago(f.getMetodoPago());
        dto.setFechaFactura(f.getFechaFactura());
        dto.setFechaInicio(f.getFechaInicio());
        dto.setFechaFin(f.getFechaFin());

        // Cliente (puede ser null en diario)
        if (f.getCliente() != null) {
            ClienteDTO c = new ClienteDTO();
            c.setCc(f.getCliente().getCc());
            c.setNombre1(f.getCliente().getNombre1());
            c.setApellido1(f.getCliente().getApellido1());
            dto.setCliente(c);
        }

        // Vendedor
        if (f.getVendedor() != null) {
            VendedorDTO v = new VendedorDTO();
            v.setCc(f.getVendedor().getCc());
            v.setNombre1(f.getVendedor().getNombre1());
            v.setApellido1(f.getVendedor().getApellido1());
            dto.setVendedor(v);
        }

        // Plan (puede ser null en diario)
        if (f.getPlan() != null) {
            PlanDTO p = new PlanDTO();
            p.setIdPlan(f.getPlan().getIdPlan());
            p.setNombre(f.getPlan().getNombre());
            p.setPrecio(f.getPlan().getPrecio());
            dto.setPlan(p);
        }

        // Detalles — protegemos contra null
        if (f.getDetalles() != null && !f.getDetalles().isEmpty()) {
            dto.setDetalles(f.getDetalles().stream().map(d -> {
                DetalleDTO dd = new DetalleDTO();
                dd.setIdDetalleFactura(d.getIdDetalleFactura());
                dd.setDescripcion(d.getDescripcion());
                dd.setValorPagado(d.getValorPagado());
                return dd;
            }).collect(Collectors.toList()));
        } else {
            dto.setDetalles(Collections.emptyList());
        }

        return dto;
    }
}
