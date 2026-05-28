package com.gimnasio.controller;

import com.gimnasio.model.Cliente;
import com.gimnasio.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/{cc}")
    public ResponseEntity<Cliente> getById(@PathVariable Integer cc) {
        return ResponseEntity.ok(clienteService.findById(cc));
    }

    @PostMapping
    public ResponseEntity<Cliente> create(@Valid @RequestBody Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.save(cliente));
    }

    @PutMapping("/{cc}")
    public ResponseEntity<Cliente> update(@PathVariable Integer cc,
                                          @Valid @RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.update(cc, cliente));
    }

    @DeleteMapping("/{cc}")
    public ResponseEntity<Void> delete(@PathVariable Integer cc) {
        clienteService.delete(cc);
        return ResponseEntity.noContent().build();
    }
}
