package com.gimnasio.controller;

import com.gimnasio.dto.AccesoDTO;
import com.gimnasio.dto.RegistrarAccesoRequestDTO;
import com.gimnasio.dto.ResumenAccesosDiaDTO;
import com.gimnasio.service.AccesoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/accesos")
@RequiredArgsConstructor
public class AccesoController {

    private final AccesoService accesoService;

    // Registrar un acceso — lo llama el dashboard al procesar ingreso
    @PostMapping
    public ResponseEntity<AccesoDTO> registrar(@RequestBody RegistrarAccesoRequestDTO req) {
        return ResponseEntity.ok(accesoService.registrar(req));
    }

    // Accesos del día actual
    @GetMapping("/hoy")
    public ResponseEntity<List<AccesoDTO>> getHoy() {
        return ResponseEntity.ok(accesoService.getAccesosHoy());
    }

    // Resumen del día — para las cards del dashboard
    @GetMapping("/resumen-hoy")
    public ResponseEntity<ResumenAccesosDiaDTO> getResumenHoy() {
        return ResponseEntity.ok(accesoService.getResumenHoy());
    }

    // Accesos en rango de fechas — para el módulo de reportes
    // GET /api/v1/accesos?inicio=2026-07-01&fin=2026-07-31
    @GetMapping
    public ResponseEntity<List<AccesoDTO>> getPorRango(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDate desde = inicio != null ? inicio : LocalDate.now();
        LocalDate hasta = fin    != null ? fin    : LocalDate.now();
        return ResponseEntity.ok(accesoService.getAccesosPorRango(desde, hasta));
    }

    // Accesos de un cliente específico — para el perfil del cliente
    @GetMapping("/cliente/{cc}")
    public ResponseEntity<List<AccesoDTO>> getPorCliente(@PathVariable Integer cc) {
        return ResponseEntity.ok(accesoService.getAccesosPorCliente(cc));
    }
}
