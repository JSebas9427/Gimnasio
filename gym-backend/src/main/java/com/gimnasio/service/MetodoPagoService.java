package com.gimnasio.service;

import com.gimnasio.model.MetodoPago;
import com.gimnasio.repository.FacturaRepository;
import com.gimnasio.repository.MetodoPagoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MetodoPagoService implements ApplicationRunner {

    private static final List<String> METODOS_INICIALES =
            List.of("EFECTIVO", "TARJETA", "TRANSFERENCIA", "NEQUI");

    private final MetodoPagoRepository metodoPagoRepository;
    private final FacturaRepository    facturaRepository;

    // Al arrancar, si la tabla está vacía se cargan los métodos que antes estaban fijos en el código
    @Override
    public void run(ApplicationArguments args) {
        if (metodoPagoRepository.count() == 0) {
            METODOS_INICIALES.forEach(n ->
                    metodoPagoRepository.save(MetodoPago.builder().nombre(n).activo(true).build()));
            log.info("Métodos de pago iniciales creados: {}", METODOS_INICIALES);
        }
    }

    @Transactional(readOnly = true)
    public List<MetodoPago> findAll(boolean soloActivos) {
        return soloActivos
                ? metodoPagoRepository.findByActivoTrueOrderByNombreAsc()
                : metodoPagoRepository.findAllByOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public MetodoPago findById(Integer id) {
        return metodoPagoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Método de pago no encontrado con id: " + id));
    }

    public MetodoPago save(MetodoPago metodo) {
        String nombre = normalizar(metodo.getNombre());
        if (metodoPagoRepository.existsByNombreIgnoreCase(nombre))
            throw new IllegalArgumentException("Ya existe un método de pago con el nombre: " + nombre);
        metodo.setIdMetodoPago(null);
        metodo.setNombre(nombre);
        return metodoPagoRepository.save(metodo);
    }

    public MetodoPago update(Integer id, MetodoPago datos) {
        MetodoPago metodo = findById(id);
        String nombreNuevo = normalizar(datos.getNombre());
        if (metodoPagoRepository.existsByNombreIgnoreCaseAndIdMetodoPagoNot(nombreNuevo, id))
            throw new IllegalArgumentException("Ya existe un método de pago con el nombre: " + nombreNuevo);

        // Las facturas guardan el nombre del método: si se renombra, se actualiza el historial
        String nombreAnterior = metodo.getNombre();
        if (!nombreAnterior.equals(nombreNuevo)) {
            int n = facturaRepository.renombrarMetodoPago(nombreAnterior, nombreNuevo);
            log.info("Método de pago '{}' renombrado a '{}' ({} facturas actualizadas)", nombreAnterior, nombreNuevo, n);
        }

        metodo.setNombre(nombreNuevo);
        metodo.setDescripcion(datos.getDescripcion());
        if (datos.getActivo() != null) metodo.setActivo(datos.getActivo());
        return metodoPagoRepository.save(metodo);
    }

    public void delete(Integer id) {
        MetodoPago metodo = findById(id);
        long usos = facturaRepository.countByMetodoPago(metodo.getNombre());
        if (usos > 0)
            throw new IllegalArgumentException("No se puede eliminar '" + metodo.getNombre()
                    + "' porque está en " + usos + " factura(s). Puede desactivarlo en su lugar.");
        metodoPagoRepository.delete(metodo);
    }

    private String normalizar(String nombre) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre del método de pago es obligatorio");
        return nombre.trim().toUpperCase();
    }
}
