package com.gimnasio.controller;

import com.gimnasio.dto.CumpleaniosDTO;
import com.gimnasio.service.CumpleaniosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/cumpleanios")
@RequiredArgsConstructor
public class CumpleaniosController {

    private final CumpleaniosService cumpleaniosService;

    // GET /api/v1/cumpleanios/mes — cumpleaños del mes actual
    @GetMapping("/mes")
    public ResponseEntity<List<CumpleaniosDTO>> getMes() {
        return ResponseEntity.ok(cumpleaniosService.getCumpleaniosMes());
    }

    // GET /api/v1/cumpleanios/hoy — cumpleaños de hoy
    @GetMapping("/hoy")
    public ResponseEntity<List<CumpleaniosDTO>> getHoy() {
        return ResponseEntity.ok(cumpleaniosService.getCumpleaniosHoy());
    }
}
