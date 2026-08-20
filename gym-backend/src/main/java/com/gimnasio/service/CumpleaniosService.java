package com.gimnasio.service;

import com.gimnasio.dto.CumpleaniosDTO;
import com.gimnasio.model.Cliente;
import com.gimnasio.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CumpleaniosService {

    private final ClienteRepository clienteRepository;

    // Cumpleaños del mes actual
    public List<CumpleaniosDTO> getCumpleaniosMes() {
        LocalDate hoy = LocalDate.now();
        return clienteRepository.findCumpleaniosMes(hoy.getMonthValue())
                .stream()
                .map(c -> toDTO(c, hoy))
                .collect(Collectors.toList());
    }

    // Cumpleaños de hoy
    public List<CumpleaniosDTO> getCumpleaniosHoy() {
        LocalDate hoy = LocalDate.now();
        return clienteRepository.findCumpleaniosHoy(hoy.getMonthValue(), hoy.getDayOfMonth())
                .stream()
                .map(c -> toDTO(c, hoy))
                .collect(Collectors.toList());
    }

    private CumpleaniosDTO toDTO(Cliente c, LocalDate hoy) {
        int edad = Period.between(c.getFechaNacimiento(), hoy).getYears();
        // Si aún no ha llegado el cumpleaños este año, la edad que cumple es +1
        boolean cumpleHoy =
            c.getFechaNacimiento().getMonthValue() == hoy.getMonthValue() &&
            c.getFechaNacimiento().getDayOfMonth()  == hoy.getDayOfMonth();

        return CumpleaniosDTO.builder()
                .cc(c.getCc())
                .nombreCompleto(c.getNombre1() + " " + c.getApellido1())
                .telefono(c.getTelefono())
                .dia(c.getFechaNacimiento().getDayOfMonth())
                .mes(c.getFechaNacimiento().getMonthValue())
                .edad(cumpleHoy ? edad : edad + 1)
                .esHoy(cumpleHoy)
                .build();
    }
}
