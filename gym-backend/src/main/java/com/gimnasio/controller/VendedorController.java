package com.gimnasio.controller;

import com.gimnasio.dto.VendedorPerfilDTO;
import com.gimnasio.model.Vendedor;
import com.gimnasio.service.VendedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/vendedores")
@RequiredArgsConstructor
public class VendedorController {

    private final VendedorService vendedorService;

    @GetMapping
    public ResponseEntity<List<Vendedor>> getAll() {
        return ResponseEntity.ok(vendedorService.findAll());
    }

    // GET /api/v1/vendedores/buscar?q=juan
    @GetMapping("/buscar")
    public ResponseEntity<List<Vendedor>> buscar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(vendedorService.buscar(q));
    }

    // GET /api/v1/vendedores/{cc}/perfil?periodo=todas|hoy|semana|mes|anio
    @GetMapping("/{cc}/perfil")
    public ResponseEntity<VendedorPerfilDTO> getPerfil(
            @PathVariable Integer cc,
            @RequestParam(required = false, defaultValue = "todas") String periodo) {
        return ResponseEntity.ok(vendedorService.getPerfil(cc, periodo));
    }

    @GetMapping("/{cc}")
    public ResponseEntity<Vendedor> getById(@PathVariable Integer cc) {
        return ResponseEntity.ok(vendedorService.findById(cc));
    }

    @PostMapping
    public ResponseEntity<Vendedor> create(@Valid @RequestBody Vendedor vendedor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendedorService.save(vendedor));
    }

    @PutMapping("/{cc}")
    public ResponseEntity<Vendedor> update(@PathVariable Integer cc,
                                           @Valid @RequestBody Vendedor vendedor) {
        return ResponseEntity.ok(vendedorService.update(cc, vendedor));
    }

    @DeleteMapping("/{cc}")
    public ResponseEntity<Void> delete(@PathVariable Integer cc) {
        vendedorService.delete(cc);
        return ResponseEntity.noContent().build();
    }
}
