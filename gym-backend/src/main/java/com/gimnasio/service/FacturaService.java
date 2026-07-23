package com.gimnasio.service;

import com.gimnasio.dto.FacturaResponseDTO;
import com.gimnasio.model.DetalleFactura;
import com.gimnasio.model.Factura;
import com.gimnasio.model.Plan;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FacturaService {

    private final FacturaRepository        facturaRepository;
    private final DetalleFacturaRepository detalleFacturaRepository;
    private final ClienteRepository        clienteRepository;
    private final VendedorRepository       vendedorRepository;
    private final PlanRepository           planRepository;

    // ── Listado y búsqueda ────────────────────────────────────────────────

    public List<FacturaResponseDTO> findAll() {
        return facturaRepository.findAll().stream()
                .map(FacturaResponseDTO::from).collect(Collectors.toList());
    }

    public FacturaResponseDTO findById(Integer id) {
        return FacturaResponseDTO.from(
                facturaRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada: " + id)));
    }

    public List<FacturaResponseDTO> findByCliente(Integer clienteCc) {
        return facturaRepository.findByCliente_Cc(clienteCc)
                .stream().map(FacturaResponseDTO::from).collect(Collectors.toList());
    }

    public List<FacturaResponseDTO> findByTipo(TipoFactura tipo) {
        return facturaRepository.findByTipo(tipo)
                .stream().map(FacturaResponseDTO::from).collect(Collectors.toList());
    }

    // ── Búsqueda combinada: término + mes/año ─────────────────────────────
    // q     = número de factura, CC cliente o CC vendedor (vacío = todos)
    // mes   = 0 → sin filtro de mes
    // anio  = 0 → sin filtro de año
    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> buscar(String q, int mes, int anio) {
        String termino = (q == null || q.isBlank()) ? "" : q.trim();
        List<Factura> facturas = facturaRepository.buscarConFiltro(termino, mes, anio);
        return facturas.stream().map(FacturaResponseDTO::from).collect(Collectors.toList());
    }

    // ── Crear factura ─────────────────────────────────────────────────────

    public FacturaResponseDTO save(Factura factura) {
        log.info("Guardando factura tipo: {}", factura.getTipo());
        validarFactura(factura);

        List<DetalleFactura> detallesOriginales = factura.getDetalles() != null
                ? new ArrayList<>(factura.getDetalles()) : new ArrayList<>();

        vendedorRepository.findById(factura.getVendedor().getCc())
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado"));

        if (factura.getTipo() == TipoFactura.MENSUALIDAD) {
            clienteRepository.findById(factura.getCliente().getCc())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado"));

            Plan plan = planRepository.findById(factura.getPlan().getIdPlan())
                    .orElseThrow(() -> new EntityNotFoundException("Plan no encontrado"));

            LocalDate inicio = factura.getFechaInicio() != null
                    ? factura.getFechaInicio() : LocalDate.now();
            LocalDate fin = factura.getFechaFin() != null
                    ? factura.getFechaFin() : inicio.plusDays(plan.getDuracion());

            factura.setFechaInicio(inicio);
            factura.setFechaFin(fin);

            // Asignar valor_esperado = precio del plan en los detalles de mensualidad
            for (DetalleFactura detalle : detallesOriginales) {
                if (detalle.getValorEsperado() == null) {
                    detalle.setValorEsperado(plan.getPrecio());
                }
            }
        }

        factura.setFechaFactura(LocalDate.now());
        factura.getDetalles().clear();
        Factura guardada = facturaRepository.saveAndFlush(factura);
        log.info("Factura guardada con id: {}", guardada.getIdFactura());

        for (DetalleFactura detalle : detallesOriginales) {
            detalle.setIdDetalleFactura(null);
            detalle.setFactura(guardada);
            guardada.getDetalles().add(detalle);
        }

        if (!detallesOriginales.isEmpty()) {
            detalleFacturaRepository.saveAllAndFlush(detallesOriginales);
            log.info("Detalles guardados: {}", detallesOriginales.size());
        }

        return FacturaResponseDTO.from(guardada);
    }

    public void delete(Integer id) {
        if (!facturaRepository.existsById(id))
            throw new EntityNotFoundException("Factura no encontrada: " + id);
        facturaRepository.deleteById(id);
    }

    // ── Validaciones ──────────────────────────────────────────────────────

    private void validarFactura(Factura factura) {
        if (factura.getTipo() == TipoFactura.MENSUALIDAD) {
            if (factura.getCliente() == null || factura.getCliente().getCc() == null)
                throw new IllegalArgumentException("Una mensualidad requiere un cliente identificado");
            if (factura.getPlan() == null || factura.getPlan().getIdPlan() == null)
                throw new IllegalArgumentException("Una mensualidad requiere un plan");
        }
        if (factura.getTipo() == TipoFactura.DIARIO) {
            if (factura.getDetalles() == null || factura.getDetalles().isEmpty())
                throw new IllegalArgumentException("Un entreno diario requiere al menos un detalle");
        }
    }
}
