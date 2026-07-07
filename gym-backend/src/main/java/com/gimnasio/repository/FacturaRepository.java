package com.gimnasio.repository;

import com.gimnasio.model.Factura;
import com.gimnasio.model.enums.TipoFactura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Integer> {

    List<Factura> findByCliente_Cc(Integer clienteCc);
    List<Factura> findByTipo(TipoFactura tipo);

    // ── Facturas de un vendedor (todas) ───────────────────────────────────
    List<Factura> findByVendedor_CcOrderByFechaFacturaDesc(Integer vendedorCc);

    // ── Facturas de un vendedor en rango ──────────────────────────────────
    List<Factura> findByVendedor_CcAndFechaFacturaBetweenOrderByFechaFacturaDesc(
            Integer vendedorCc, LocalDate inicio, LocalDate fin);

    // ── Reportes: facturas en rango ───────────────────────────────────────
    List<Factura> findByFechaFacturaBetween(LocalDate inicio, LocalDate fin);
    List<Factura> findByFechaFacturaBetweenAndTipo(LocalDate inicio, LocalDate fin, TipoFactura tipo);

    // ── Reportes: sumas ───────────────────────────────────────────────────
    @Query("""
        SELECT COALESCE(SUM(d.valorPagado), 0)
        FROM DetalleFactura d
        WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin
    """)
    BigDecimal sumIngresosByFecha(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    @Query("""
        SELECT COALESCE(SUM(d.valorPagado), 0)
        FROM DetalleFactura d
        WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin
          AND d.factura.tipo = :tipo
    """)
    BigDecimal sumIngresosByFechaAndTipo(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin, @Param("tipo") TipoFactura tipo);

    @Query("""
        SELECT COALESCE(SUM(d.valorPagado), 0)
        FROM DetalleFactura d
        WHERE d.factura.fechaFactura BETWEEN :inicio AND :fin
          AND d.factura.metodoPago = :metodo
    """)
    BigDecimal sumIngresosByFechaAndMetodo(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin, @Param("metodo") String metodo);

    // ── Reportes: sumas por vendedor ──────────────────────────────────────
    @Query("""
        SELECT COALESCE(SUM(d.valorPagado), 0)
        FROM DetalleFactura d
        WHERE d.factura.vendedor.cc = :vendedorCc
          AND (:inicio IS NULL OR d.factura.fechaFactura >= :inicio)
          AND (:fin    IS NULL OR d.factura.fechaFactura <= :fin)
    """)
    BigDecimal sumIngresosByVendedor(
            @Param("vendedorCc") Integer vendedorCc,
            @Param("inicio")     LocalDate inicio,
            @Param("fin")        LocalDate fin);

    // ── Reportes: conteos ─────────────────────────────────────────────────
    Long countByFechaFacturaBetween(LocalDate inicio, LocalDate fin);
    Long countByFechaFacturaBetweenAndTipo(LocalDate inicio, LocalDate fin, TipoFactura tipo);

    // ── Gráfica: ingresos por día ─────────────────────────────────────────
    @Query("""
        SELECT f.fechaFactura, COALESCE(SUM(d.valorPagado), 0), COUNT(f)
        FROM Factura f JOIN f.detalles d
        WHERE f.fechaFactura BETWEEN :inicio AND :fin
        GROUP BY f.fechaFactura
        ORDER BY f.fechaFactura ASC
    """)
    List<Object[]> ingresosPorDia(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}
