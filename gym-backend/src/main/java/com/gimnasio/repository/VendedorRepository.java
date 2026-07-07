package com.gimnasio.repository;

import com.gimnasio.model.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Integer> {

    boolean existsByCorreo(String correo);

    // ── Búsqueda por CC, nombre o apellido ────────────────────────────────
    @Query("""
        SELECT v FROM Vendedor v
        WHERE CAST(v.cc AS string) LIKE %:q%
           OR LOWER(v.nombre1)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(v.nombre2)   LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(v.apellido1) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(v.apellido2) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY v.apellido1 ASC
    """)
    List<Vendedor> buscar(@Param("q") String q);
}
