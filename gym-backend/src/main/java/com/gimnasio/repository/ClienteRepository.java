package com.gimnasio.repository;

import com.gimnasio.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    boolean existsByCorreo(String correo);

    List<Cliente> findByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);
    Long countByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);

    // ── Búsqueda por CC, nombre o apellido (insensible a mayúsculas) ──────
    @Query("""
        SELECT c FROM Cliente c
        WHERE CAST(c.cc AS string) LIKE %:q%
           OR LOWER(c.nombre1)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.nombre2)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.apellido1) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(c.apellido2) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY c.apellido1 ASC
    """)
    List<Cliente> buscar(@Param("q") String q);
}
