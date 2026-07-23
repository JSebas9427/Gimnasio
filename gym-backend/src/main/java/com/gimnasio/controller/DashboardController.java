package com.gimnasio.controller;

import com.gimnasio.dto.*;
import com.gimnasio.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // Cards superiores + conteos de membresías + alertas
    @GetMapping("/resumen")
    public ResponseEntity<DashboardResumenDTO> getResumen() {
        return ResponseEntity.ok(dashboardService.getResumen());
    }

    // Datos para el gráfico circular
    @GetMapping("/estado-membresias")
    public ResponseEntity<EstadoMembresiasDTO> getEstadoMembresias() {
        return ResponseEntity.ok(dashboardService.getEstadoMembresias());
    }

    // Clientes próximos a vencer
    // GET /api/v1/dashboard/proximos-a-vencer?dias=7
    @GetMapping("/proximos-a-vencer")
    public ResponseEntity<List<ClienteProximoVencerDTO>> getProximosAVencer(
            @RequestParam(defaultValue = "7") int dias) {
        return ResponseEntity.ok(dashboardService.getProximosAVencer(dias));
    }

    // Búsqueda rápida de cliente para panel de ingreso
    // GET /api/v1/dashboard/cliente-ingreso?cc=12345678
    @GetMapping("/cliente-ingreso")
    public ResponseEntity<ClienteBusquedaRapidaDTO> getClienteIngreso(
            @RequestParam Integer cc) {
        ClienteBusquedaRapidaDTO resultado = dashboardService.buscarClienteIngreso(cc);
        if (resultado == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(resultado);
    }
}
