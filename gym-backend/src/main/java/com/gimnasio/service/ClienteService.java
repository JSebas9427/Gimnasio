package com.gimnasio.service;

import com.gimnasio.model.Cliente;
import com.gimnasio.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    public Cliente findById(Integer cc) {
        return clienteRepository.findById(cc)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con CC: " + cc));
    }

    public Cliente save(Cliente cliente) {
        if (clienteRepository.existsById(cliente.getCc())) {
            throw new IllegalArgumentException("Ya existe un cliente con CC: " + cliente.getCc());
        }
        return clienteRepository.save(cliente);
    }

    public Cliente update(Integer cc, Cliente clienteActualizado) {
        Cliente cliente = findById(cc);
        cliente.setNombre1(clienteActualizado.getNombre1());
        cliente.setNombre2(clienteActualizado.getNombre2());
        cliente.setApellido1(clienteActualizado.getApellido1());
        cliente.setApellido2(clienteActualizado.getApellido2());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setCorreo(clienteActualizado.getCorreo());
        return clienteRepository.save(cliente);
    }

    public void delete(Integer cc) {
        if (!clienteRepository.existsById(cc)) {
            throw new EntityNotFoundException("Cliente no encontrado con CC: " + cc);
        }
        clienteRepository.deleteById(cc);
    }
}
