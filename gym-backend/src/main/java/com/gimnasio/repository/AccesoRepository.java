package com.gimnasio.repository;

import com.gimnasio.model.Acceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccesoRepository extends JpaRepository<Acceso, Integer> {

    // Accesos del día ordenados por hora descendente
    List<Acceso> findByFechaAccesoOrderByHoraAccesoDesc(LocalDate fecha);

    // Accesos en rango de fechas
    List<Acceso> findByFechaAccesoBetweenOrderByFechaAccesoDescHoraAccesoDesc(
            LocalDate inicio, LocalDate fin);

    // Accesos de un cliente específico
    List<Acceso> findByCcOrderByFechaAccesoDescHoraAccesoDesc(Integer cc);

    // Conteo de accesos del día
    Long countByFechaAcceso(LocalDate fecha);

    // Conteo por estado en un día
    Long countByFechaAccesoAndEstadoAcceso(LocalDate fecha, String estadoAcceso);

    // Últimos N accesos (para el feed en vivo del dashboard)
    @Query("""
        SELECT a FROM Acceso a
        WHERE a.fechaAcceso = :fecha
        ORDER BY a.horaAcceso DESC
    """)
    List<Acceso> findUltimosDelDia(@Param("fecha") LocalDate fecha);
}
