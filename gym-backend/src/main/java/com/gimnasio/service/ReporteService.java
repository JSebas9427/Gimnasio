package com.gimnasio.service;

import com.gimnasio.dto.ReporteClienteNuevoDTO;
import com.gimnasio.dto.ReporteIngresoDiaDTO;
import com.gimnasio.dto.ReporteIngresoDTO;
import com.gimnasio.dto.ReporteResumenDTO;
import com.gimnasio.model.Cliente;
import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.ClienteRepository;
import com.gimnasio.repository.FacturaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final FacturaRepository  facturaRepository;
    private final ClienteRepository  clienteRepository;

    // ── Resumen general del período ───────────────────────────────────────
    public ReporteResumenDTO getResumen(LocalDate inicio, LocalDate fin) {
        log.info("Generando resumen del {} al {}", inicio, fin);

        BigDecimal totalIngresos      = facturaRepository.sumIngresosByFecha(inicio, fin);
        BigDecimal totalMensualidades = facturaRepository.sumIngresosByFechaAndTipo(inicio, fin, TipoFactura.MENSUALIDAD);
        BigDecimal totalDiarios       = facturaRepository.sumIngresosByFechaAndTipo(inicio, fin, TipoFactura.DIARIO);

        Long cantidadFacturas       = facturaRepository.countByFechaFacturaBetween(inicio, fin);
        Long cantidadMensualidades  = facturaRepository.countByFechaFacturaBetweenAndTipo(inicio, fin, TipoFactura.MENSUALIDAD);
        Long cantidadDiarios        = facturaRepository.countByFechaFacturaBetweenAndTipo(inicio, fin, TipoFactura.DIARIO);

        Long clientesNuevos = clienteRepository.countByFechaRegistroBetween(
                inicio.atStartOfDay(), fin.atTime(LocalTime.MAX));

        BigDecimal totalEfectivo      = facturaRepository.sumIngresosByFechaAndMetodo(inicio, fin, "EFECTIVO");
        BigDecimal totalTarjeta       = facturaRepository.sumIngresosByFechaAndMetodo(inicio, fin, "TARJETA");
        BigDecimal totalTransferencia = facturaRepository.sumIngresosByFechaAndMetodo(inicio, fin, "TRANSFERENCIA");
        BigDecimal totalNequi         = facturaRepository.sumIngresosByFechaAndMetodo(inicio, fin, "NEQUI");

        return ReporteResumenDTO.builder()
                .totalIngresos(totalIngresos)
                .totalMensualidades(totalMensualidades)
                .totalDiarios(totalDiarios)
                .cantidadFacturas(cantidadFacturas)
                .cantidadMensualidades(cantidadMensualidades)
                .cantidadDiarios(cantidadDiarios)
                .clientesNuevos(clientesNuevos)
                .totalEfectivo(totalEfectivo)
                .totalTarjeta(totalTarjeta)
                .totalTransferencia(totalTransferencia)
                .totalNequi(totalNequi)
                .build();
    }

    // ── Lista de facturas del período (para la tabla) ─────────────────────
    public List<ReporteIngresoDTO> getIngresos(LocalDate inicio, LocalDate fin) {
        List<Factura> facturas = facturaRepository.findByFechaFacturaBetween(inicio, fin);

        return facturas.stream().map(f -> {
            // Sumar todos los detalles de esta factura
            BigDecimal valor = f.getDetalles() == null ? BigDecimal.ZERO :
                    f.getDetalles().stream()
                            .map(d -> d.getValorPagado() != null ? d.getValorPagado() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Nombre del plan del primer detalle (si aplica)
            String planNombre = f.getPlan() != null ? f.getPlan().getNombre() : null;

            // Nombre completo del cliente
            String clienteNombre = null;
            Integer clienteCc = null;
            if (f.getCliente() != null) {
                clienteCc = f.getCliente().getCc();
                clienteNombre = f.getCliente().getNombre1() + " " + f.getCliente().getApellido1();
            }

            // Nombre del vendedor
            String vendedorNombre = null;
            Integer vendedorCc = null;
            if (f.getVendedor() != null) {
                vendedorCc = f.getVendedor().getCc();
                vendedorNombre = f.getVendedor().getNombre1() + " " + f.getVendedor().getApellido1();
            }

            return ReporteIngresoDTO.builder()
                    .idFactura(f.getIdFactura())
                    .fechaFactura(f.getFechaFactura())
                    .tipo(f.getTipo().name())
                    .metodoPago(f.getMetodoPago())
                    .valor(valor)
                    .clienteCc(clienteCc)
                    .clienteNombre(clienteNombre)
                    .vendedorCc(vendedorCc)
                    .vendedorNombre(vendedorNombre)
                    .planNombre(planNombre)
                    .build();
        }).collect(Collectors.toList());
    }

    // ── Ingresos agrupados por día (para la gráfica) ──────────────────────
    public List<ReporteIngresoDiaDTO> getIngresosPorDia(LocalDate inicio, LocalDate fin) {
        List<Object[]> rows = facturaRepository.ingresosPorDia(inicio, fin);

        return rows.stream().map(row -> ReporteIngresoDiaDTO.builder()
                .fecha((LocalDate) row[0])
                .totalDia((BigDecimal) row[1])
                .cantidadFacturas((Long) row[2])
                .build()
        ).collect(Collectors.toList());
    }

    // ── Clientes nuevos del período ───────────────────────────────────────
    public List<ReporteClienteNuevoDTO> getClientesNuevos(LocalDate inicio, LocalDate fin) {
        List<Cliente> clientes = clienteRepository.findByFechaRegistroBetween(
                inicio.atStartOfDay(), fin.atTime(LocalTime.MAX));

        return clientes.stream().map(c -> {
            // Buscar si tiene factura de mensualidad en el mismo período
            String planNombre = facturaRepository
                    .findByCliente_Cc(c.getCc())
                    .stream()
                    .filter(f -> f.getTipo() == TipoFactura.MENSUALIDAD && f.getPlan() != null)
                    .findFirst()
                    .map(f -> f.getPlan().getNombre())
                    .orElse(null);

            return ReporteClienteNuevoDTO.builder()
                    .cc(c.getCc())
                    .nombreCompleto(c.getNombre1() + " " + c.getApellido1())
                    .telefono(c.getTelefono())
                    .correo(c.getCorreo())
                    .fechaRegistro(c.getFechaRegistro())
                    .planNombre(planNombre)
                    .build();
        }).collect(Collectors.toList());
    }
}
