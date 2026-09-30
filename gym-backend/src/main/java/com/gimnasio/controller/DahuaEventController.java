package com.gimnasio.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import com.gimnasio.dto.ClienteBusquedaRapidaDTO;
import com.gimnasio.model.Acceso;
import com.gimnasio.repository.AccesoRepository;
import com.gimnasio.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

// Desactivado por defecto: los eventos del Dahua los procesa ahora el programa "Control Torniquete"
// (evita doble registro en la tabla acceso). Para reactivar: gym.dahua.push.habilitado=true
@ConditionalOnProperty(name = "gym.dahua.push.habilitado", havingValue = "true")
@Slf4j
@RestController
@RequiredArgsConstructor
public class DahuaEventController {

    private final DashboardService dashboardService;
    private final AccesoRepository accesoRepository;

    // Registro inicial del dispositivo
    // El Dahua envía POST /cgi-bin/api/autoRegist/connect
    // El filtro lo reescribe a /api/cgi-bin/api/autoRegist/connect
    @PostMapping("/cgi-bin/api/autoRegist/connect")
    public ResponseEntity<Map<String, Object>> connect(
            @RequestBody(required = false) Map<String, Object> body) {
        log.info("Dahua registrado — body: {}", body);
        return ResponseEntity.ok(Map.of("Result", 0, "ResultDetail", "Success"));
    }

    // Eventos de acceso del Dahua
    // El Dahua envía POST /api/v1/dahua/event (ya incluye /api)
    @PostMapping("/api/v1/dahua/event")
    public ResponseEntity<Map<String, Object>> recibirEvento(
            @RequestBody Map<String, Object> body) {

        String code   = (String) body.get("Code");
        String action = (String) body.get("Action");

        log.info("Evento Dahua — Code: {}, Action: {}", code, action);

        if (!"AccessControl".equals(code) || !"Pulse".equals(action)) {
            return ResponseEntity.ok(Map.of("Result", 0));
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) body.get("Data");
        if (data == null) {
            return ResponseEntity.ok(Map.of("Result", 0));
        }

        String  userId   = (String) data.get("UserID");
        String  cardName = (String) data.get("CardName");
        Integer method   = data.get("Method") instanceof Number
                ? ((Number) data.get("Method")).intValue() : 0;

        log.info("Verificando — UserID: {}, Nombre: {}", userId, cardName);

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.ok(Map.of("Result", 0));
        }

        String estadoAcceso;
        String motivo      = null;
        String nombre      = cardName != null ? cardName : "UserID " + userId;
        String tipoPersona = "CLIENTE";

        try {
            Integer cc = Integer.parseInt(userId.trim());
            ClienteBusquedaRapidaDTO resultado = dashboardService.buscarClienteIngreso(cc);

            if (resultado == null) {
                estadoAcceso = "DENEGADO";
                motivo       = "CC no registrada en el sistema";
            } else {
                nombre      = resultado.getNombreCompleto();
                tipoPersona = resultado.getTipoPersona();
                if (resultado.getAccesoPermitido()) {
                    estadoAcceso = "PERMITIDO";
                    log.info("Acceso PERMITIDO — CC: {}", cc);
                } else {
                    estadoAcceso = "DENEGADO";
                    motivo       = resultado.getMotivoDenegacion();
                    log.warn("Acceso DENEGADO — CC: {}, Motivo: {}", cc, motivo);
                }
            }
        } catch (NumberFormatException e) {
            estadoAcceso = "DENEGADO";
            motivo       = "ID no válido";
        }

        // Guardar en tabla acceso
        accesoRepository.save(Acceso.builder()
                .cc(parseCc(userId))
                .tipoPersona(tipoPersona)
                .nombre(nombre)
                .estadoAcceso(estadoAcceso)
                .motivoDenegacion(motivo)
                .metodo(resolverMetodo(method))
                .fechaAcceso(LocalDate.now())
                .horaAcceso(LocalTime.now())
                .build());

        // Result=0 → permitir, Result=1 → denegar
        int result = "PERMITIDO".equals(estadoAcceso) ? 0 : 1;
        return ResponseEntity.ok(Map.of(
                "Result", result,
                "ResultDetail", result == 0 ? "Access Granted" : "Access Denied"
        ));
    }

    private Integer parseCc(String userId) {
        try { return Integer.parseInt(userId.trim()); }
        catch (Exception e) { return null; }
    }

    private String resolverMetodo(int method) {
        return switch (method) {
            case 1  -> "TARJETA";
            case 4  -> "HUELLA";
            case 8, 15 -> "FACIAL";
            case 16 -> "CONTRASEÑA";
            default -> "DAHUA";
        };
    }
}
