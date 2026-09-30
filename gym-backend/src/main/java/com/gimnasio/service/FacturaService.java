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
import org.springframework.data.domain.Sort;
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
    // q     = palabras a buscar en # factura, CC/nombre/apellido del cliente, CC/nombre
    //         del vendedor o nombre del entreno diario (vacío = todos). Ver BusquedaSpecs.
    // mes   = 0 → sin filtro de mes
    // anio  = 0 → sin filtro de año
    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> buscar(String q, int mes, int anio) {
        List<Factura> facturas = facturaRepository.findAll(
                BusquedaSpecs.facturas(q, mes, anio),
                Sort.by(Sort.Order.desc("fechaFactura"), Sort.Order.desc("idFactura")));
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
            factura.setNombrePersona(null);
        } else {
            factura.setNombrePersona(factura.getNombrePersona().trim());
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
    public FacturaResponseDTO update(Integer id, Factura request) {
        Factura factura = facturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada: " + id));

        if (request.getTipo() == TipoFactura.DIARIO
                && (request.getNombrePersona() == null || request.getNombrePersona().isBlank()))
            throw new IllegalArgumentException("Un entreno diario requiere el nombre de la persona");

        // Actualizar campos básicos
        factura.setTipo(request.getTipo());
        factura.setMetodoPago(request.getMetodoPago());
        factura.setFechaInicio(request.getFechaInicio());
        factura.setFechaFin(request.getFechaFin());
        factura.setNombrePersona(request.getTipo() == TipoFactura.DIARIO
                ? request.getNombrePersona().trim() : null);

        // Actualizar vendedor
        if (request.getVendedor() != null && request.getVendedor().getCc() != null) {
            // Se asigna la entidad cargada (no el objeto del request, que solo trae la CC)
            factura.setVendedor(vendedorRepository.findById(request.getVendedor().getCc())
                    .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado")));
        }

        // Actualizar cliente
        if (request.getCliente() != null && request.getCliente().getCc() != null) {
            factura.setCliente(clienteRepository.findById(request.getCliente().getCc())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado")));
        } else {
            factura.setCliente(null);
        }

        // Actualizar plan y recalcular valor esperado en detalles existentes de la BD
        if (request.getPlan() != null && request.getPlan().getIdPlan() != null) {
            Plan plan = planRepository.findById(request.getPlan().getIdPlan())
                    .orElseThrow(() -> new EntityNotFoundException("Plan no encontrado"));
            factura.setPlan(plan);

            // Buscar detalles reales de la BD y actualizar valor esperado
            List<DetalleFactura> detallesBD = detalleFacturaRepository.findByFactura_IdFactura(id);
            for (DetalleFactura detalle : detallesBD) {
                detalle.setValorEsperado(plan.getPrecio());
                // Si viene valor pagado en el request, actualizarlo
                if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
                    detalle.setValorPagado(request.getDetalles().get(0).getValorPagado());
                }
            }
            detalleFacturaRepository.saveAll(detallesBD);
        } else {
            factura.setPlan(null);
            // Sin plan (entreno diario) — el valor esperado es lo mismo que se pagó
            if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
                DetalleFactura nuevo = request.getDetalles().get(0);
                List<DetalleFactura> detallesBD = detalleFacturaRepository.findByFactura_IdFactura(id);
                for (DetalleFactura detalle : detallesBD) {
                    detalle.setValorPagado(nuevo.getValorPagado());
                    detalle.setValorEsperado(nuevo.getValorPagado());
                    if (nuevo.getDescripcion() != null) detalle.setDescripcion(nuevo.getDescripcion());
                }
                detalleFacturaRepository.saveAll(detallesBD);
            }
        }

        Factura actualizada = facturaRepository.save(factura);
        return FacturaResponseDTO.from(actualizada);
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
            if (factura.getNombrePersona() == null || factura.getNombrePersona().isBlank())
                throw new IllegalArgumentException("Un entreno diario requiere el nombre de la persona");
        }
    }
}
