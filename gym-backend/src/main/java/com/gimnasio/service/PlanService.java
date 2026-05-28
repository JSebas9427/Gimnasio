package com.gimnasio.service;

import com.gimnasio.model.Plan;
import com.gimnasio.repository.PlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> findAll() {
        return planRepository.findAll();
    }

    public Plan findById(Integer id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plan no encontrado con id: " + id));
    }

    public Plan save(Plan plan) {
        if (planRepository.existsByNombre(plan.getNombre())) {
            throw new IllegalArgumentException("Ya existe un plan con el nombre: " + plan.getNombre());
        }
        return planRepository.save(plan);
    }

    public Plan update(Integer id, Plan planActualizado) {
        Plan plan = findById(id);
        plan.setNombre(planActualizado.getNombre());
        plan.setPrecio(planActualizado.getPrecio());
        plan.setDuracion(planActualizado.getDuracion());
        plan.setDescripcion(planActualizado.getDescripcion());
        return planRepository.save(plan);
    }

    public void delete(Integer id) {
        if (!planRepository.existsById(id)) {
            throw new EntityNotFoundException("Plan no encontrado con id: " + id);
        }
        planRepository.deleteById(id);
    }
}
