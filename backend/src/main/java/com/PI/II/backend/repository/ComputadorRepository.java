package com.PI.II.backend.repository;

import com.PI.II.backend.model.Computador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComputadorRepository extends JpaRepository<Computador, Long> {
}