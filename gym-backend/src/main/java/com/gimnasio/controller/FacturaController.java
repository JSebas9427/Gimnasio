package com.gimnasio.controller;

import com.gimnasio.dto.FacturaResponseDTO;
import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @GetMapping
    public ResponseEntity<List<FacturaResponseDTO>> getAll() {
        return ResponseEntity.ok(facturaService.findAll());
    }

    // GET /api/v1/facturas/buscar?q=123&mes=6&anio=2026
    // Todos los parámetros son opcionales:
    //   q    → número de factura, CC cliente o CC vendedor
    //   mes  → 1-12 (0 o ausente = sin filtro)
    //   anio → ej. 2026 (0 o ausente = sin filtro)
    @GetMapping("/buscar")
    public ResponseEntity<List<FacturaResponseDTO>> buscar(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "0") int mes,
            @RequestParam(required = false, defaultValue = "0") int anio) {
        return ResponseEntity.ok(facturaService.buscar(q, mes, anio));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaResponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(facturaService.findById(id));
    }

    @GetMapping("/cliente/{cc}")
    public ResponseEntity<List<FacturaResponseDTO>> getByCliente(@PathVariable Integer cc) {
        return ResponseEntity.ok(facturaService.findByCliente(cc));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<FacturaResponseDTO>> getByTipo(@PathVariable TipoFactura tipo) {
        return ResponseEntity.ok(facturaService.findByTipo(tipo));
    }

    @PostMapping
    public ResponseEntity<FacturaResponseDTO> create(@RequestBody Factura factura) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.save(factura));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        facturaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
