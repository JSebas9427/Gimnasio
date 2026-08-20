package com.gimnasio.controller;

import com.gimnasio.dto.TorniqueteResponseDTO;
import com.gimnasio.service.TorniqueteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/torniquete")
@RequiredArgsConstructor
public class TorniqueteController {

    private final TorniqueteService torniqueteService;

    // GET /api/v1/torniquete/estado
    @GetMapping("/estado")
    public ResponseEntity<TorniqueteResponseDTO> getEstado() {
        return ResponseEntity.ok(torniqueteService.verificarConexion());
    }

    // POST /api/v1/torniquete/abrir
    @PostMapping("/abrir")
    public ResponseEntity<TorniqueteResponseDTO> abrir() {
        return ResponseEntity.ok(torniqueteService.abrirTorniquete());
    }
}
