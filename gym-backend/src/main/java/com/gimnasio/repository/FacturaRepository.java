package com.gimnasio.repository;

import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Integer> {
    List<Factura> findByCliente_Cc(Integer clienteCc);
    List<Factura> findByTipo(TipoFactura tipo);
    List<Factura> findByVendedor_Cc(Integer vendedorCc);
}
