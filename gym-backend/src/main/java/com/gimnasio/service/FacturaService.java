package com.gimnasio.service;

import com.gimnasio.model.DetalleFactura;
import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.ClienteRepository;
import com.gimnasio.repository.DetalleFacturaRepository;
import com.gimnasio.repository.FacturaRepository;
import com.gimnasio.repository.VendedorRepository;
import com.gimnasio.repository.PlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FacturaService {

    private final FacturaRepository        facturaRepository;
    private final DetalleFacturaRepository detalleFacturaRepository;
    private final ClienteRepository        clienteRepository;
    private final VendedorRepository       vendedorRepository;
    private final PlanRepository           planRepository;

    public List<Factura> findAll() {
        return facturaRepository.findAll();
    }

    public Factura findById(Integer id) {
        return facturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada con id: " + id));
    }

    public List<Factura> findByCliente(Integer clienteCc) {
        return facturaRepository.findByCliente_Cc(clienteCc);
    }

    public List<Factura> findByTipo(TipoFactura tipo) {
        return facturaRepository.findByTipo(tipo);
    }

    public Factura save(Factura factura) {
        validarFactura(factura);

        // Verificar que el vendedor existe
        vendedorRepository.findById(factura.getVendedor().getCc())
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado"));

        // Si es mensualidad verificar cliente y plan
        if (factura.getTipo() == TipoFactura.MENSUALIDAD) {
            clienteRepository.findById(factura.getCliente().getCc())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado"));
            planRepository.findById(factura.getPlan().getIdPlan())
                    .orElseThrow(() -> new EntityNotFoundException("Plan no encontrado"));
        }

        // Guardar factura primero
        Factura facturaGuardada = facturaRepository.save(factura);

        // Asociar detalles a la factura guardada
        if (factura.getDetalles() != null) {
            for (DetalleFactura detalle : factura.getDetalles()) {
                detalle.setFactura(facturaGuardada);
            }
            detalleFacturaRepository.saveAll(factura.getDetalles());
        }

        return facturaGuardada;
    }

    public void delete(Integer id) {
        if (!facturaRepository.existsById(id)) {
            throw new EntityNotFoundException("Factura no encontrada con id: " + id);
        }
        facturaRepository.deleteById(id);
    }

    // ── Validaciones por tipo ──────────────────────────────────────────────────

    private void validarFactura(Factura factura) {
        if (factura.getTipo() == TipoFactura.MENSUALIDAD) {
            if (factura.getCliente() == null || factura.getCliente().getCc() == null) {
                throw new IllegalArgumentException("Una mensualidad requiere un cliente identificado");
            }
            if (factura.getPlan() == null || factura.getPlan().getIdPlan() == null) {
                throw new IllegalArgumentException("Una mensualidad requiere un plan");
            }
            if (factura.getFechaInicio() == null || factura.getFechaFin() == null) {
                throw new IllegalArgumentException("Una mensualidad requiere fechas de inicio y fin");
            }
        }

        if (factura.getTipo() == TipoFactura.DIARIO) {
            if (factura.getDetalles() == null || factura.getDetalles().isEmpty()) {
                throw new IllegalArgumentException("Un entreno diario requiere al menos un detalle con el valor");
            }
        }
    }
}
