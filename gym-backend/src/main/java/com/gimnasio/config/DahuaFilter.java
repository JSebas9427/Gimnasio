package com.gimnasio.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

// Desactivado por defecto: los eventos del Dahua los procesa ahora el programa "Control Torniquete"
// (evita doble registro en la tabla acceso). Para reactivar: gym.dahua.push.habilitado=true
@ConditionalOnProperty(name = "gym.dahua.push.habilitado", havingValue = "true")
@Component
@Order(1)
public class DahuaFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String uri = req.getRequestURI();

        if (uri.startsWith("/cgi-bin/") || uri.equals("/api/v1/dahua/event")) {
            final String newUri = "/api" + uri;
            chain.doFilter(new HttpServletRequestWrapper(req) {
                @Override public String getRequestURI()  { return newUri; }
                @Override public String getServletPath() { return newUri; }
                @Override public String getPathInfo()    { return null;   }
            }, response);
            return;
        }

        chain.doFilter(request, response);
    }
}