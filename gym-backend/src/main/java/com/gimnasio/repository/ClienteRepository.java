package com.gimnasio.repository;

import com.gimnasio.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
// La búsqueda por texto (nombre + apellido, nombre, apellido o cédula) está en
// BusquedaSpecs.clientes(q) y se ejecuta con findAll(spec) de JpaSpecificationExecutor.
public interface ClienteRepository extends JpaRepository<Cliente, Integer>, JpaSpecificationExecutor<Cliente> {

    boolean existsByCorreo(String correo);

    @Query("""
    SELECT c FROM Cliente c
    WHERE (c.activo IS NULL OR c.activo = 1)
      AND c.fechaRegistro BETWEEN :inicio AND :fin
""")
    List<Cliente> findActivosByFechaRegistroBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
    List<Cliente> findByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);
    Long countByFechaRegistroBetween(LocalDateTime inicio, LocalDateTime fin);

    // Cumpleaños del mes
    @Query("""
        SELECT c FROM Cliente c
        WHERE c.fechaNacimiento IS NOT NULL
          AND MONTH(c.fechaNacimiento) = :mes
        ORDER BY DAY(c.fechaNacimiento) ASC
    """)
    List<Cliente> findCumpleaniosMes(@Param("mes") int mes);

    // Cumpleaños de hoy
    @Query("""
        SELECT c FROM Cliente c
        WHERE c.fechaNacimiento IS NOT NULL
          AND MONTH(c.fechaNacimiento) = :mes
          AND DAY(c.fechaNacimiento)   = :dia
    """)
    List<Cliente> findCumpleaniosHoy(@Param("mes") int mes, @Param("dia") int dia);
}
