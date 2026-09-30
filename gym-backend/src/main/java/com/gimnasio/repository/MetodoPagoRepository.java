package com.gimnasio.repository;

import com.gimnasio.model.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdMetodoPagoNot(String nombre, Integer idMetodoPago);
    List<MetodoPago> findAllByOrderByNombreAsc();
    List<MetodoPago> findByActivoTrueOrderByNombreAsc();
}
