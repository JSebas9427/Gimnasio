package com.gimnasio.service;

import com.gimnasio.dto.*;
import com.gimnasio.model.Cliente;
import com.gimnasio.model.Factura;
import com.gimnasio.model.Vendedor;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.ClienteRepository;
import com.gimnasio.repository.FacturaRepository;
import com.gimnasio.repository.VendedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final FacturaRepository  facturaRepository;
    private final ClienteRepository  clienteRepository;
    private final VendedorRepository vendedorRepository;

    // ── Resumen general ───────────────────────────────────────────────────
    public DashboardResumenDTO getResumen() {
        LocalDate hoy   = LocalDate.now();
        LocalDate lunes = hoy.with(java.time.DayOfWeek.MONDAY);

        BigDecimal ingresosHoy    = facturaRepository.sumIngresosByFecha(hoy, hoy);
        BigDecimal ingresosSemana = facturaRepository.sumIngresosByFecha(lunes, hoy);
        Long       facturasHoy    = facturaRepository.countByFechaFacturaBetween(hoy, hoy);

        List<Cliente> clientes = clienteRepository.findAll();
        long total = clientes.size(), activos = 0, agotados = 0, sinPlan = 0;

        for (Cliente c : clientes) {
            switch (calcularEstadoCliente(c.getCc())) {
                case "ACTIVO"  -> activos++;
                case "AGOTADO" -> agotados++;
                default        -> sinPlan++;
            }
        }

        long vencenHoy   = facturaRepository.findClientesProximosAVencer(hoy, hoy).size();
        long vencen3dias = facturaRepository.findClientesProximosAVencer(hoy, hoy.plusDays(3)).size();
        long vencen7dias = facturaRepository.findClientesProximosAVencer(hoy, hoy.plusDays(7)).size();

        return DashboardResumenDTO.builder()
                .ingresosHoy(ingresosHoy)
                .facturasHoy(facturasHoy)
                .ingresosSemana(ingresosSemana)
                .totalClientes(total)
                .clientesActivos(activos)
                .clientesAgotados(agotados)
                .clientesSinPlan(sinPlan)
                .clientesVencenHoy(vencenHoy)
                .clientesVencen3Dias(vencen3dias)
                .clientesVencen7Dias(vencen7dias)
                .build();
    }

    // ── Estado membresías para gráfico ────────────────────────────────────
    public EstadoMembresiasDTO getEstadoMembresias() {
        List<Cliente> clientes = clienteRepository.findAll();
        long total = clientes.size(), activos = 0, agotados = 0, sinPlan = 0;

        for (Cliente c : clientes) {
            switch (calcularEstadoCliente(c.getCc())) {
                case "ACTIVO"  -> activos++;
                case "AGOTADO" -> agotados++;
                default        -> sinPlan++;
            }
        }

        return EstadoMembresiasDTO.builder()
                .activos(activos).agotados(agotados).sinPlan(sinPlan).total(total)
                .porcentajeActivos(round(total > 0  ? (double) activos  / total * 100 : 0))
                .porcentajeAgotados(round(total > 0 ? (double) agotados / total * 100 : 0))
                .porcentajeSinPlan(round(total > 0  ? (double) sinPlan  / total * 100 : 0))
                .build();
    }

    // ── Próximos a vencer ─────────────────────────────────────────────────
    public List<ClienteProximoVencerDTO> getProximosAVencer(int dias) {
        LocalDate hoy = LocalDate.now();
        return facturaRepository.findClientesProximosAVencer(hoy, hoy.plusDays(dias)).stream()
                .map(f -> ClienteProximoVencerDTO.builder()
                        .cc(f.getCliente() != null ? f.getCliente().getCc() : null)
                        .nombreCompleto(f.getCliente() != null
                                ? f.getCliente().getNombre1() + " " + f.getCliente().getApellido1()
                                : "Desconocido")
                        .telefono(f.getCliente() != null ? f.getCliente().getTelefono() : null)
                        .planNombre(f.getPlan() != null ? f.getPlan().getNombre() : null)
                        .fechaFin(f.getFechaFin())
                        .diasRestantes((int) ChronoUnit.DAYS.between(hoy, f.getFechaFin()))
                        .build())
                .collect(Collectors.toList());
    }

    // ── Búsqueda de ingreso — valida clientes Y empleados ─────────────────
    public ClienteBusquedaRapidaDTO buscarClienteIngreso(Integer cc) {

        // 1. Buscar primero en vendedores (empleados)
        Optional<Vendedor> vendedorOpt = vendedorRepository.findById(cc);
        if (vendedorOpt.isPresent()) {
            Vendedor v = vendedorOpt.get();
            log.info("Acceso de empleado — CC: {}, Cargo: {}", cc, v.getCargo());
            return ClienteBusquedaRapidaDTO.builder()
                    .cc(v.getCc())
                    .nombreCompleto(v.getNombre1() + " " + v.getApellido1())
                    .telefono(v.getTelefono())
                    .tipoPersona("EMPLEADO")
                    .cargo(v.getCargo() != null ? v.getCargo() : "Empleado")
                    .accesoPermitido(true)   // ← empleados siempre tienen acceso
                    .motivoDenegacion(null)
                    .build();
        }

        // 2. Buscar en clientes
        Optional<Cliente> clienteOpt = clienteRepository.findById(cc);
        if (clienteOpt.isEmpty()) return null;

        Cliente cliente = clienteOpt.get();
        List<Factura> mensualidades = facturaRepository.findUltimaMensualidadByCliente(cc);
        Factura ultima = mensualidades.isEmpty() ? null : mensualidades.get(0);

        String    estado;
        LocalDate fechaFin    = null;
        LocalDate fechaInicio = null;
        String    planNombre  = null;
        Integer   diasRestantes = null;
        String    motivo      = null;

        if (ultima == null) {
            estado = "SIN_PLAN";
            motivo = "El cliente no tiene un plan activo";
        } else {
            fechaFin    = ultima.getFechaFin();
            fechaInicio = ultima.getFechaInicio();
            planNombre  = ultima.getPlan() != null ? ultima.getPlan().getNombre() : null;
            long dias   = ChronoUnit.DAYS.between(LocalDate.now(), fechaFin);
            diasRestantes = (int) dias;

            if (fechaFin.isBefore(LocalDate.now())) {
                estado = "AGOTADO";
                motivo = "La membresía venció hace " + Math.abs(diasRestantes) + " días";
            } else {
                estado = "ACTIVO";
            }
        }

        log.info("Acceso de cliente — CC: {}, Estado: {}", cc, estado);

        return ClienteBusquedaRapidaDTO.builder()
                .cc(cliente.getCc())
                .nombreCompleto(cliente.getNombre1() + " " + cliente.getApellido1())
                .telefono(cliente.getTelefono())
                .tipoPersona("CLIENTE")
                .estado(estado)
                .planNombre(planNombre)
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .diasRestantes(diasRestantes)
                .accesoPermitido("ACTIVO".equals(estado))
                .motivoDenegacion(motivo)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private String calcularEstadoCliente(Integer cc) {
        List<Factura> m = facturaRepository.findUltimaMensualidadByCliente(cc);
        if (m.isEmpty() || m.get(0).getFechaFin() == null) return "SIN_PLAN";
        return m.get(0).getFechaFin().isBefore(LocalDate.now()) ? "AGOTADO" : "ACTIVO";
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
