package com.gimnasio.repository;

import com.gimnasio.model.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Integer> {
    boolean existsByCorreo(String correo);
}
