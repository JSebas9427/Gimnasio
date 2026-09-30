package com.gimnasio.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.apache.catalina.connector.Connector;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Desactivado por defecto: los eventos del Dahua los procesa ahora el programa "Control Torniquete"
// (evita doble registro en la tabla acceso). Para reactivar: gym.dahua.push.habilitado=true
@ConditionalOnProperty(name = "gym.dahua.push.habilitado", havingValue = "true")
@Configuration
public class DahuaServerConfig {

    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
        connector.setPort(8082);
        tomcat.addAdditionalTomcatConnectors(connector);
        return tomcat;
    }
}