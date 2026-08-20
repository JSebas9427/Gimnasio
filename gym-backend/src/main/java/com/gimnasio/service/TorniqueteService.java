package com.gimnasio.service;

import com.gimnasio.dto.TorniqueteResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.auth.BasicCredentialsProvider;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TorniqueteService {

    @Value("${torniquete.ip:192.168.0.150}")
    private String ip;

    @Value("${torniquete.usuario:admin}")
    private String usuario;

    @Value("${torniquete.password:10203040aA}")
    private String password;

    @Value("${torniquete.canal:1}")
    private int canal;

    @Value("${torniquete.simulado:false}")
    private boolean simulado;

    // ── Verificar conexión ─────────────────────────────────────────────────
    public TorniqueteResponseDTO verificarConexion() {
        if (simulado) {
            return TorniqueteResponseDTO.builder()
                    .exito(true).estado("CONECTADO")
                    .mensaje("Modo simulado activo").build();
        }

        try (CloseableHttpClient client = crearClienteHttp()) {
            // Usar magicBox para verificar conexión — sabemos que responde 200
            String url = "http://" + ip + "/cgi-bin/magicBox.cgi?action=getDeviceType";
            HttpGet request = new HttpGet(url);

            return client.execute(request, response -> {
                int status = response.getCode();
                log.info("Verificacion torniquete — Status: {}", status);
                if (status == 200) {
                    return TorniqueteResponseDTO.builder()
                            .exito(true).estado("CONECTADO")
                            .mensaje("Torniquete DHI-ASI3204E-W conectado en " + ip).build();
                }
                return TorniqueteResponseDTO.builder()
                        .exito(false).estado("DESCONECTADO")
                        .mensaje("Respuesta inesperada: " + status).build();
            });

        } catch (Exception e) {
            log.warn("Torniquete no responde — {}", e.getMessage());
            return TorniqueteResponseDTO.builder()
                    .exito(false).estado("DESCONECTADO")
                    .mensaje("Sin conexión con el torniquete").build();
        }
    }

    // ── Abrir torniquete ───────────────────────────────────────────────────
    public TorniqueteResponseDTO abrirTorniquete() {
        if (simulado) {
            log.info("Torniquete abierto (simulado)");
            return TorniqueteResponseDTO.builder()
                    .exito(true).estado("CONECTADO")
                    .mensaje("Torniquete abierto (simulado)").build();
        }

        try (CloseableHttpClient client = crearClienteHttp()) {
            // Endpoint CGI correcto para DHI-ASI3204E-W
            String url = "http://" + ip
                    + "/cgi-bin/accessControl.cgi?action=openDoor&channel=" + canal;

            HttpGet request = new HttpGet(url);

            return client.execute(request, response -> {
                int status = response.getCode();
                String body = response.getEntity() != null
                        ? new String(response.getEntity().getContent().readAllBytes())
                        : "";
                log.info("Apertura torniquete — Status: {} Body: {}", status, body);

                if (status == 200) {
                    return TorniqueteResponseDTO.builder()
                            .exito(true).estado("CONECTADO")
                            .mensaje("✅ Torniquete abierto correctamente").build();
                }
                return TorniqueteResponseDTO.builder()
                        .exito(false).estado("CONECTADO")
                        .mensaje("Error al abrir — código: " + status).build();
            });

        } catch (Exception e) {
            log.error("Error al abrir torniquete: {}", e.getMessage());
            return TorniqueteResponseDTO.builder()
                    .exito(false).estado("DESCONECTADO")
                    .mensaje("Error de conexión: " + e.getMessage()).build();
        }
    }

    // ── Cliente HTTP con autenticación Digest ─────────────────────────────
    private CloseableHttpClient crearClienteHttp() {
        BasicCredentialsProvider credProvider = new BasicCredentialsProvider();
        credProvider.setCredentials(
            new AuthScope(ip, 80),
            new UsernamePasswordCredentials(usuario, password.toCharArray())
        );

        return HttpClients.custom()
                .setDefaultCredentialsProvider(credProvider)
                .build();
    }
}
