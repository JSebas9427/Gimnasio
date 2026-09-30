package com.gimnasio.controller;

import com.gimnasio.model.MetodoPago;
import com.gimnasio.service.MetodoPagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/metodos-pago")
@RequiredArgsConstructor
public class MetodoPagoController {

    private final MetodoPagoService metodoPagoService;

    // GET /api/v1/metodos-pago?soloActivos=true
    @GetMapping
    public ResponseEntity<List<MetodoPago>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean soloActivos) {
        return ResponseEntity.ok(metodoPagoService.findAll(soloActivos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MetodoPago> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(metodoPagoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MetodoPago> create(@Valid @RequestBody MetodoPago metodo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(metodoPagoService.save(metodo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetodoPago> update(@PathVariable Integer id,
                                             @Valid @RequestBody MetodoPago metodo) {
        return ResponseEntity.ok(metodoPagoService.update(id, metodo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        metodoPagoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
