package com.gimnasio.controller;

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
    public ResponseEntity<List<Factura>> getAll() {
        return ResponseEntity.ok(facturaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Factura> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(facturaService.findById(id));
    }

    // GET /v1/facturas/cliente/12345678
    @GetMapping("/cliente/{cc}")
    public ResponseEntity<List<Factura>> getByCliente(@PathVariable Integer cc) {
        return ResponseEntity.ok(facturaService.findByCliente(cc));
    }

    // GET /v1/facturas/tipo/MENSUALIDAD  o  /tipo/DIARIO
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Factura>> getByTipo(@PathVariable TipoFactura tipo) {
        return ResponseEntity.ok(facturaService.findByTipo(tipo));
    }

    @PostMapping
    public ResponseEntity<Factura> create(@RequestBody Factura factura) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.save(factura));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        facturaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
