package com.gimnasio.repository;

import com.gimnasio.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    boolean existsByCorreo(String correo);

    // ── Clientes nuevos en rango ──────────────────────────────────────────
    List<Cliente> findByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);

    Long countByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);
}
