package com.gimnasio.controller;

import com.gimnasio.dto.ReporteClienteNuevoDTO;
import com.gimnasio.dto.ReporteIngresoDiaDTO;
import com.gimnasio.dto.ReporteIngresoDTO;
import com.gimnasio.dto.ReporteResumenDTO;
import com.gimnasio.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    /**
     * Resumen general del período.
     * GET /api/v1/reportes/resumen?inicio=2026-06-01&fin=2026-06-30
     * Si no se pasan parámetros, devuelve el día de hoy.
     */
    @GetMapping("/resumen")
    public ResponseEntity<ReporteResumenDTO> getResumen(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDate desde = inicio != null ? inicio : LocalDate.now();
        LocalDate hasta = fin    != null ? fin    : LocalDate.now();
        return ResponseEntity.ok(reporteService.getResumen(desde, hasta));
    }

    /**
     * Lista de facturas del período con totales por fila.
     * GET /api/v1/reportes/ingresos?inicio=2026-06-01&fin=2026-06-30
     */
    @GetMapping("/ingresos")
    public ResponseEntity<List<ReporteIngresoDTO>> getIngresos(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDate desde = inicio != null ? inicio : LocalDate.now();
        LocalDate hasta = fin    != null ? fin    : LocalDate.now();
        return ResponseEntity.ok(reporteService.getIngresos(desde, hasta));
    }

    /**
     * Ingresos agrupados por día — para la gráfica de barras.
     * GET /api/v1/reportes/ingresos-por-dia?inicio=2026-06-01&fin=2026-06-07
     */
    @GetMapping("/ingresos-por-dia")
    public ResponseEntity<List<ReporteIngresoDiaDTO>> getIngresosPorDia(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        // Por defecto: últimos 7 días
        LocalDate hasta = fin    != null ? fin    : LocalDate.now();
        LocalDate desde = inicio != null ? inicio : hasta.minusDays(6);
        return ResponseEntity.ok(reporteService.getIngresosPorDia(desde, hasta));
    }

    /**
     * Clientes nuevos registrados en el período.
     * GET /api/v1/reportes/clientes-nuevos?inicio=2026-06-01&fin=2026-06-30
     */
    @GetMapping("/clientes-nuevos")
    public ResponseEntity<List<ReporteClienteNuevoDTO>> getClientesNuevos(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDate desde = inicio != null ? inicio : LocalDate.now();
        LocalDate hasta = fin    != null ? fin    : LocalDate.now();
        return ResponseEntity.ok(reporteService.getClientesNuevos(desde, hasta));
    }
}
