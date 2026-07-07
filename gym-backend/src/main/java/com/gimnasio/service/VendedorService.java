package com.gimnasio.service;

import com.gimnasio.dto.FacturaResponseDTO;
import com.gimnasio.dto.VendedorPerfilDTO;
import com.gimnasio.model.Factura;
import com.gimnasio.model.Vendedor;
import com.gimnasio.model.enums.TipoFactura;
import com.gimnasio.repository.FacturaRepository;
import com.gimnasio.repository.VendedorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendedorService {

    private final VendedorRepository vendedorRepository;
    private final FacturaRepository  facturaRepository;

    // ── CRUD base ─────────────────────────────────────────────────────────

    public List<Vendedor> findAll() {
        return vendedorRepository.findAll();
    }

    public Vendedor findById(Integer cc) {
        return vendedorRepository.findById(cc)
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado con CC: " + cc));
    }

    public Vendedor save(Vendedor vendedor) {
        if (vendedorRepository.existsById(vendedor.getCc()))
            throw new IllegalArgumentException("Ya existe un vendedor con CC: " + vendedor.getCc());
        return vendedorRepository.save(vendedor);
    }

    public Vendedor update(Integer cc, Vendedor v) {
        Vendedor vendedor = findById(cc);
        vendedor.setNombre1(v.getNombre1());
        vendedor.setNombre2(v.getNombre2());
        vendedor.setApellido1(v.getApellido1());
        vendedor.setApellido2(v.getApellido2());
        vendedor.setCargo(v.getCargo());
        vendedor.setTelefono(v.getTelefono());
        vendedor.setCorreo(v.getCorreo());
        return vendedorRepository.save(vendedor);
    }

    public void delete(Integer cc) {
        if (!vendedorRepository.existsById(cc))
            throw new EntityNotFoundException("Vendedor no encontrado con CC: " + cc);
        vendedorRepository.deleteById(cc);
    }

    // ── Búsqueda ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Vendedor> buscar(String q) {
        if (q == null || q.isBlank()) return vendedorRepository.findAll();
        return vendedorRepository.buscar(q.trim());
    }

    // ── Perfil completo con facturas filtradas ────────────────────────────

    @Transactional(readOnly = true)
    public VendedorPerfilDTO getPerfil(Integer cc, String periodo) {
        Vendedor vendedor = findById(cc);

        // Calcular rango de fechas según período
        LocalDate[] rango = calcularRango(periodo);
        LocalDate inicio = rango[0];
        LocalDate fin    = rango[1];

        // Facturas del vendedor en el período
        List<Factura> facturas = (inicio == null)
                ? facturaRepository.findByVendedor_CcOrderByFechaFacturaDesc(cc)
                : facturaRepository.findByVendedor_CcAndFechaFacturaBetweenOrderByFechaFacturaDesc(cc, inicio, fin);

        // Resumen calculado
        BigDecimal totalIngresos = facturas.stream()
                .flatMap(f -> f.getDetalles() != null ? f.getDetalles().stream() : java.util.stream.Stream.empty())
                .map(d -> d.getValorPagado() != null ? d.getValorPagado() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalMensualidades = facturas.stream()
                .filter(f -> f.getTipo() == TipoFactura.MENSUALIDAD).count();
        long totalDiarios = facturas.stream()
                .filter(f -> f.getTipo() == TipoFactura.DIARIO).count();

        List<FacturaResponseDTO> facturasDTO = facturas.stream()
                .map(FacturaResponseDTO::from)
                .collect(Collectors.toList());

        return VendedorPerfilDTO.builder()
                .cc(vendedor.getCc())
                .nombre1(vendedor.getNombre1())
                .nombre2(vendedor.getNombre2())
                .apellido1(vendedor.getApellido1())
                .apellido2(vendedor.getApellido2())
                .nombreCompleto(vendedor.getNombre1() + " " + vendedor.getApellido1())
                .cargo(vendedor.getCargo())
                .telefono(vendedor.getTelefono())
                .correo(vendedor.getCorreo())
                .totalFacturas((long) facturas.size())
                .totalMensualidades(totalMensualidades)
                .totalDiarios(totalDiarios)
                .totalIngresos(totalIngresos)
                .facturas(facturasDTO)
                .build();
    }

    // ── Helper: calcular rango de fechas ──────────────────────────────────
    // Devuelve [inicio, fin]. Si inicio es null = sin filtro (todas).

    private LocalDate[] calcularRango(String periodo) {
        LocalDate hoy = LocalDate.now();

        return switch (periodo == null ? "todas" : periodo.toLowerCase()) {
            case "hoy"     -> new LocalDate[]{ hoy, hoy };
            case "semana"  -> new LocalDate[]{ hoy.with(java.time.DayOfWeek.MONDAY), hoy };
            case "mes"     -> new LocalDate[]{ hoy.withDayOfMonth(1), hoy };
            case "anio", "año" -> new LocalDate[]{ hoy.withDayOfYear(1), hoy };
            default        -> new LocalDate[]{ null, null }; // todas
        };
    }
}
