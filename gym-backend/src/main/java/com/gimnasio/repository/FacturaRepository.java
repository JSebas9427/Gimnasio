package com.gimnasio.repository;

import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Integer>, JpaSpecificationExecutor<Factura> {

    List<Factura> findByCliente_Cc(Integer clienteCc);
    List<Factura> findByTipo(TipoFactura tipo);
    List<Factura> findByVendedor_CcOrderByFechaFacturaDesc(Integer vendedorCc);
    List<Factura> findByVendedor_CcAndFechaFacturaBetweenOrderByFechaFacturaDesc(
            Integer vendedorCc, LocalDate inicio, LocalDate fin);

    // ── Dashboard: última mensualidad de un cliente ───────────────────────
    @Query("""
        SELECT f FROM Factura f
        WHERE f.cliente.cc = :cc
          AND f.tipo = 'MENSUALIDAD'
          AND f.fechaFin IS NOT NULL
        ORDER BY f.fechaFin DESC
    """)
    List<Factura> findUltimaMensualidadByCliente(@Param("cc") Integer cc);

    // ── Dashboard: clientes que vencen entre dos fechas ───────────────────
    @Query("""
        SELECT f FROM Factura f
        WHERE f.tipo = 'MENSUALIDAD'
          AND f.fechaFin BETWEEN :inicio AND :fin
          AND f.fechaFin = (
              SELECT MAX(f2.fechaFin) FROM Factura f2
              WHERE f2.cliente.cc = f.cliente.cc
                AND f2.tipo = 'MENSUALIDAD'
          )
        ORDER BY f.fechaFin ASC
    """)
    List<Factura> findClientesProximosAVencer(
            @Param("inicio") LocalDate inicio,
            @Param("fin")    LocalDate fin);

    // La búsqueda combinada de facturas (texto + mes/año) está en
    // BusquedaSpecs.facturas(q, mes, anio) y se ejecuta con findAll(spec, sort).

    // ── Métodos de pago ──────────────────────────────────────────────────
    long countByMetodoPago(String metodoPago);

    @Modifying
    @Query("UPDATE Factura f SET f.metodoPago = :nuevo WHERE f.metodoPago = :anterior")
    int renombrarMetodoPago(@Param("anterior") String anterior, @Param("nuevo") String nuevo);

    @Query("SELECT d.factura.metodoPago, COALESCE(SUM(d.valorPagado),0) FROM DetalleFactura d WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin GROUP BY d.factura.metodoPago ORDER BY SUM(d.valorPagado) DESC")
    List<Object[]> sumIngresosPorMetodo(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    // ── Reportes: sumas ───────────────────────────────────────────────────
    List<Factura> findByFechaFacturaBetween(LocalDate inicio, LocalDate fin);
    List<Factura> findByFechaFacturaBetweenAndTipo(LocalDate inicio, LocalDate fin, TipoFactura tipo);

    @Query("SELECT COALESCE(SUM(d.valorPagado),0) FROM DetalleFactura d WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin")
    BigDecimal sumIngresosByFecha(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    @Query("SELECT COALESCE(SUM(d.valorPagado),0) FROM DetalleFactura d WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin AND d.factura.tipo = :tipo")
    BigDecimal sumIngresosByFechaAndTipo(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin, @Param("tipo") TipoFactura tipo);

    @Query("SELECT COALESCE(SUM(d.valorPagado),0) FROM DetalleFactura d WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin AND d.factura.metodoPago = :metodo")
    BigDecimal sumIngresosByFechaAndMetodo(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin, @Param("metodo") String metodo);

    @Query("SELECT COALESCE(SUM(d.valorPagado),0) FROM DetalleFactura d WHERE d.factura.vendedor.cc = :vendedorCc AND (:inicio IS NULL OR d.factura.fechaFactura >= :inicio) AND (:fin IS NULL OR d.factura.fechaFactura <= :fin)")
    BigDecimal sumIngresosByVendedor(@Param("vendedorCc") Integer vendedorCc, @Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    Long countByFechaFacturaBetween(LocalDate inicio, LocalDate fin);
    Long countByFechaFacturaBetweenAndTipo(LocalDate inicio, LocalDate fin, TipoFactura tipo);

    @Query("SELECT f.fechaFactura, COALESCE(SUM(d.valorPagado),0), COUNT(f) FROM Factura f JOIN f.detalles d WHERE f.fechaFactura BETWEEN :inicio AND :fin GROUP BY f.fechaFactura ORDER BY f.fechaFactura ASC")
    List<Object[]> ingresosPorDia(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}
