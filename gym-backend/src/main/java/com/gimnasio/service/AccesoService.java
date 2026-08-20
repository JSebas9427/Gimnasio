package com.gimnasio.service;

import com.gimnasio.dto.AccesoDTO;
import com.gimnasio.dto.RegistrarAccesoRequestDTO;
import com.gimnasio.dto.ResumenAccesosDiaDTO;
import com.gimnasio.model.Acceso;
import com.gimnasio.repository.AccesoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccesoService {

    private final AccesoRepository accesoRepository;

    // ── Registrar un acceso ───────────────────────────────────────────────
    @Transactional
    public AccesoDTO registrar(RegistrarAccesoRequestDTO req) {
        Acceso acceso = Acceso.builder()
                .cc(req.getCc())
                .tipoPersona(req.getTipoPersona())
                .nombre(req.getNombre())
                .estadoAcceso(req.getEstadoAcceso())
                .motivoDenegacion(req.getMotivoDenegacion())
                .metodo(req.getMetodo() != null ? req.getMetodo() : "CC_MANUAL")
                .fechaAcceso(LocalDate.now())
                .horaAcceso(LocalTime.now())
                .build();

        Acceso guardado = accesoRepository.save(acceso);
        log.info("Acceso registrado — CC: {} Tipo: {} Estado: {}",
                req.getCc(), req.getTipoPersona(), req.getEstadoAcceso());

        return toDTO(guardado);
    }

    // ── Accesos del día ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AccesoDTO> getAccesosHoy() {
        return accesoRepository
                .findByFechaAccesoOrderByHoraAccesoDesc(LocalDate.now())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Accesos en rango de fechas ────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AccesoDTO> getAccesosPorRango(LocalDate inicio, LocalDate fin) {
        return accesoRepository
                .findByFechaAccesoBetweenOrderByFechaAccesoDescHoraAccesoDesc(inicio, fin)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Accesos de un cliente ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AccesoDTO> getAccesosPorCliente(Integer cc) {
        return accesoRepository
                .findByCcOrderByFechaAccesoDescHoraAccesoDesc(cc)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Resumen del día ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public ResumenAccesosDiaDTO getResumenHoy() {
        LocalDate hoy = LocalDate.now();
        List<Acceso> accesos = accesoRepository.findByFechaAccesoOrderByHoraAccesoDesc(hoy);

        long total      = accesos.size();
        long permitidos = accesos.stream().filter(a -> "PERMITIDO".equals(a.getEstadoAcceso())).count();
        long denegados  = accesos.stream().filter(a -> "DENEGADO".equals(a.getEstadoAcceso())).count();
        long clientes   = accesos.stream().filter(a -> "CLIENTE".equals(a.getTipoPersona())).count();
        long empleados  = accesos.stream().filter(a -> "EMPLEADO".equals(a.getTipoPersona())).count();

        return ResumenAccesosDiaDTO.builder()
                .totalHoy(total)
                .permitidosHoy(permitidos)
                .denegadosHoy(denegados)
                .clientesHoy(clientes)
                .empleadosHoy(empleados)
                .build();
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private AccesoDTO toDTO(Acceso a) {
        return AccesoDTO.builder()
                .idAcceso(a.getIdAcceso())
                .cc(a.getCc())
                .tipoPersona(a.getTipoPersona())
                .nombre(a.getNombre())
                .estadoAcceso(a.getEstadoAcceso())
                .motivoDenegacion(a.getMotivoDenegacion())
                .metodo(a.getMetodo())
                .fechaAcceso(a.getFechaAcceso())
                .horaAcceso(a.getHoraAcceso())
                .build();
    }
}
