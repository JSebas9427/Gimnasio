package com.gimnasio.service;

import com.gimnasio.model.Vendedor;
import com.gimnasio.repository.VendedorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VendedorService {

    private final VendedorRepository vendedorRepository;

    public List<Vendedor> findAll() {
        return vendedorRepository.findAll();
    }

    public Vendedor findById(Integer cc) {
        return vendedorRepository.findById(cc)
                .orElseThrow(() -> new EntityNotFoundException("Vendedor no encontrado con CC: " + cc));
    }

    public Vendedor save(Vendedor vendedor) {
        if (vendedorRepository.existsById(vendedor.getCc())) {
            throw new IllegalArgumentException("Ya existe un vendedor con CC: " + vendedor.getCc());
        }
        return vendedorRepository.save(vendedor);
    }

    public Vendedor update(Integer cc, Vendedor vendedorActualizado) {
        Vendedor vendedor = findById(cc);
        vendedor.setNombre1(vendedorActualizado.getNombre1());
        vendedor.setNombre2(vendedorActualizado.getNombre2());
        vendedor.setApellido1(vendedorActualizado.getApellido1());
        vendedor.setApellido2(vendedorActualizado.getApellido2());
        vendedor.setCargo(vendedorActualizado.getCargo());
        vendedor.setTelefono(vendedorActualizado.getTelefono());
        vendedor.setCorreo(vendedorActualizado.getCorreo());
        return vendedorRepository.save(vendedor);
    }

    public void delete(Integer cc) {
        if (!vendedorRepository.existsById(cc)) {
            throw new EntityNotFoundException("Vendedor no encontrado con CC: " + cc);
        }
        vendedorRepository.deleteById(cc);
    }
}
