package com.gimnasio.repository;

import com.gimnasio.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Integer> {
    boolean existsByNombre(String nombre);
}
