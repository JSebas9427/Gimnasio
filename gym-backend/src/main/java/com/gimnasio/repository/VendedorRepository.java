package com.gimnasio.repository;

import com.gimnasio.model.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

// La búsqueda por texto (nombre + apellido, nombre, apellido o cédula) está en
// BusquedaSpecs.vendedores(q) y se ejecuta con findAll(spec, sort).
@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Integer>, JpaSpecificationExecutor<Vendedor> {

    boolean existsByCorreo(String correo);
}
