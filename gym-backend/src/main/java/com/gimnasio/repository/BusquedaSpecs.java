package com.gimnasio.repository;

import com.gimnasio.model.Cliente;
import com.gimnasio.model.Factura;
import com.gimnasio.model.Vendedor;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiFunction;

/**
 * Búsqueda por texto libre, combinada o individual.
 *
 * El texto se parte en palabras y CADA palabra debe coincidir (parcialmente) con
 * ALGUNO de los campos. Así funcionan todas estas formas:
 *   "juan"          → nombre, apellido o cédula que contenga "juan"
 *   "perez"         → idem
 *   "juan perez"    → personas con "juan" en algún campo Y "perez" en algún campo
 *   "perez juan"    → mismo resultado (el orden no importa)
 *   "1023"          → cédulas que contengan 1023
 *   "juan 1023"     → combinación de nombre y cédula
 *
 * Las tildes y mayúsculas no importan: la BD usa collation utf8mb4_unicode_ci
 * (insensible a acentos) y además se compara en minúsculas.
 */
public final class BusquedaSpecs {

    private BusquedaSpecs() {}

    public static List<String> palabras(String q) {
        if (q == null || q.isBlank()) return List.of();
        return Arrays.stream(q.trim().toLowerCase().split("\\s+"))
                .filter(p -> !p.isBlank())
                .toList();
    }

    // ── Clientes (solo activos) ───────────────────────────────────────────
    public static Specification<Cliente> clientes(String q) {
        Specification<Cliente> activos = (root, query, cb) -> cb.or(
                cb.isNull(root.get("activo")), cb.equal(root.get("activo"), 1));
        return activos.and(porPalabras(q, (root, cb) -> List.of(
                texto(cb, root.get("cc")),
                root.get("nombre1"), root.get("nombre2"),
                root.get("apellido1"), root.get("apellido2"))));
    }

    // ── Vendedores / empleados ────────────────────────────────────────────
    public static Specification<Vendedor> vendedores(String q) {
        return porPalabras(q, (root, cb) -> List.of(
                texto(cb, root.get("cc")),
                root.get("nombre1"), root.get("nombre2"),
                root.get("apellido1"), root.get("apellido2")));
    }

    // ── Facturas: # factura, cliente (CC/nombre), vendedor (CC/nombre) o
    //    nombre del entreno diario; más filtro opcional por mes/año ────────
    public static Specification<Factura> facturas(String q, int mes, int anio) {
        Specification<Factura> spec = porPalabras(q, (root, cb) -> {
            // LEFT JOIN: los entrenos diarios no tienen cliente
            Join<Factura, Cliente>  c = root.join("cliente",  JoinType.LEFT);
            Join<Factura, Vendedor> v = root.join("vendedor", JoinType.LEFT);
            return List.of(
                    texto(cb, root.get("idFactura")),
                    root.get("nombrePersona"),
                    texto(cb, c.get("cc")), c.get("nombre1"), c.get("apellido1"), c.get("apellido2"),
                    texto(cb, v.get("cc")), v.get("nombre1"), v.get("apellido1"));
        });
        if (mes > 0)
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.function("MONTH", Integer.class, root.get("fechaFactura")), mes));
        if (anio > 0)
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.function("YEAR", Integer.class, root.get("fechaFactura")), anio));
        return spec;
    }

    // ── Núcleo: AND entre palabras, OR entre campos ───────────────────────
    private static <T> Specification<T> porPalabras(
            String q, BiFunction<Root<T>, CriteriaBuilder, List<Expression<String>>> camposFn) {

        List<String> palabras = palabras(q);
        return (root, query, cb) -> {
            if (palabras.isEmpty()) return cb.conjunction();
            // Los campos (y sus joins) se crean una sola vez por consulta
            List<Expression<String>> campos = camposFn.apply(root, cb);
            query.distinct(true);

            List<Predicate> porPalabra = new ArrayList<>();
            for (String palabra : palabras) {
                String patron = "%" + escaparLike(palabra) + "%";
                Predicate[] algunCampo = campos.stream()
                        .map(campo -> cb.like(cb.lower(cb.coalesce(campo, "")), patron, '\\'))
                        .toArray(Predicate[]::new);
                porPalabra.add(cb.or(algunCampo));
            }
            return cb.and(porPalabra.toArray(Predicate[]::new));
        };
    }

    // Número → texto, para buscar coincidencias parciales en cédulas e ids
    private static Expression<String> texto(CriteriaBuilder cb, Path<?> numero) {
        return numero.as(String.class);
    }

    // Evita que % o _ escritos por el usuario actúen como comodines
    private static String escaparLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
