package com.gimnasio.service;

import com.gimnasio.dto.ClientePerfilDTO;
import com.gimnasio.dto.ClienteResumenDTO;
import com.gimnasio.dto.FacturaResponseDTO;
import com.gimnasio.model.Cliente;
import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.ClienteRepository;
import com.gimnasio.repository.FacturaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final FacturaRepository  facturaRepository;

    // ── CRUD base ─────────────────────────────────────────────────────────

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    public Cliente findById(Integer cc) {
        return clienteRepository.findById(cc)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con CC: " + cc));
    }

    public Cliente save(Cliente cliente) {
        if (clienteRepository.existsById(cliente.getCc()))
            throw new IllegalArgumentException("Ya existe un cliente con CC: " + cliente.getCc());
        return clienteRepository.save(cliente);
    }

    public Cliente update(Integer cc, Cliente clienteActualizado) {
        Cliente cliente = findById(cc);
        cliente.setNombre1(clienteActualizado.getNombre1());
        cliente.setNombre2(clienteActualizado.getNombre2());
        cliente.setApellido1(clienteActualizado.getApellido1());
        cliente.setApellido2(clienteActualizado.getApellido2());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setCorreo(clienteActualizado.getCorreo());
        return clienteRepository.save(cliente);
    }

    public void delete(Integer cc) {
        if (!clienteRepository.existsById(cc))
            throw new EntityNotFoundException("Cliente no encontrado con CC: " + cc);
        clienteRepository.deleteById(cc);
    }

    // ── Lista con estado calculado ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClienteResumenDTO> findAllConEstado() {
        return clienteRepository.findAll().stream()
                .map(this::toResumen)
                .collect(Collectors.toList());
    }

    // ── Búsqueda + filtro por estado ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ClienteResumenDTO> buscar(String q, String estado) {
        List<Cliente> clientes = (q != null && !q.isBlank())
                ? clienteRepository.buscar(q.trim())
                : clienteRepository.findAll();

        return clientes.stream()
                .map(this::toResumen)
                .filter(r -> estado == null || estado.isBlank() || estado.equalsIgnoreCase("TODOS")
                          || r.getEstado().equalsIgnoreCase(estado))
                .collect(Collectors.toList());
    }

    // ── Perfil completo del cliente ───────────────────────────────────────

    @Transactional(readOnly = true)
    public ClientePerfilDTO getPerfil(Integer cc) {
        Cliente cliente = findById(cc);
        List<Factura> facturas = facturaRepository.findByCliente_Cc(cc);

        // Última mensualidad para calcular estado
        Factura ultimaMensualidad = facturas.stream()
                .filter(f -> f.getTipo() == TipoFactura.MENSUALIDAD && f.getFechaFin() != null)
                .max(Comparator.comparing(Factura::getFechaFin))
                .orElse(null);

        String    estado          = calcularEstado(ultimaMensualidad);
        LocalDate ultimaFechaFin  = ultimaMensualidad != null ? ultimaMensualidad.getFechaFin() : null;
        String    ultimoPlan      = ultimaMensualidad != null && ultimaMensualidad.getPlan() != null
                                    ? ultimaMensualidad.getPlan().getNombre() : null;
        Integer   diasRestantes   = calcularDiasRestantes(ultimaFechaFin);

        List<FacturaResponseDTO> facturasDTO = facturas.stream()
                .sorted(Comparator.comparing(
                        f -> f.getFechaFactura() != null ? f.getFechaFactura() : LocalDate.MIN,
                        Comparator.reverseOrder()))
                .map(FacturaResponseDTO::from)
                .collect(Collectors.toList());

        return ClientePerfilDTO.builder()
                .cc(cliente.getCc())
                .nombre1(cliente.getNombre1())
                .nombre2(cliente.getNombre2())
                .apellido1(cliente.getApellido1())
                .apellido2(cliente.getApellido2())
                .nombreCompleto(cliente.getNombre1() + " " + cliente.getApellido1())
                .telefono(cliente.getTelefono())
                .correo(cliente.getCorreo())
                .fechaRegistro(cliente.getFechaRegistro())
                .estado(estado)
                .ultimaFechaFin(ultimaFechaFin)
                .ultimoPlan(ultimoPlan)
                .diasRestantes(diasRestantes)
                .facturas(facturasDTO)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private ClienteResumenDTO toResumen(Cliente c) {
        List<Factura> facturas = facturaRepository.findByCliente_Cc(c.getCc());

        Factura ultima = facturas.stream()
                .filter(f -> f.getTipo() == TipoFactura.MENSUALIDAD && f.getFechaFin() != null)
                .max(Comparator.comparing(Factura::getFechaFin))
                .orElse(null);

        LocalDate fechaFin   = ultima != null ? ultima.getFechaFin() : null;
        String    plan       = ultima != null && ultima.getPlan() != null ? ultima.getPlan().getNombre() : null;

        return ClienteResumenDTO.builder()
                .cc(c.getCc())
                .nombreCompleto(c.getNombre1() + " " + c.getApellido1())
                .telefono(c.getTelefono())
                .correo(c.getCorreo())
                .fechaRegistro(c.getFechaRegistro())
                .estado(calcularEstado(ultima))
                .ultimaFechaFin(fechaFin)
                .ultimoPlan(plan)
                .diasRestantes(calcularDiasRestantes(fechaFin))
                .build();
    }

    private String calcularEstado(Factura ultimaMensualidad) {
        if (ultimaMensualidad == null || ultimaMensualidad.getFechaFin() == null)
            return "SIN_PLAN";
        return ultimaMensualidad.getFechaFin().isBefore(LocalDate.now())
                ? "AGOTADO" : "ACTIVO";
    }

    private Integer calcularDiasRestantes(LocalDate fechaFin) {
        if (fechaFin == null) return null;
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), fechaFin);
    }
}
