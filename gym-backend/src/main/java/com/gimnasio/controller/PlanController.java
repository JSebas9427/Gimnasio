package com.gimnasio.controller;

import com.gimnasio.model.Plan;
import com.gimnasio.service.PlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/planes")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<List<Plan>> getAll() {
        return ResponseEntity.ok(planService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plan> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(planService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Plan> create(@Valid @RequestBody Plan plan) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.save(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plan> update(@PathVariable Integer id,
                                       @Valid @RequestBody Plan plan) {
        return ResponseEntity.ok(planService.update(id, plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
