package com.PI.II.backend.repository;

import com.PI.II.backend.model.Computador;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ComputadorRepository extends JpaRepository<Computador, Long> {

    Optional<Computador> findByNumeroSerie(String numeroSerie);

    // Validação
    boolean existsByNumeroSerie(String numeroSerie);

    // Filtros
    // Filtra por Status E Setor ao mesmo tempo
    List<Computador> findByStatusAndSetorId(String status, Long setorId);

    // Filtra só por Status
    List<Computador> findByStatus(String status);

    // Filtra só por Setor
    List<Computador> findBySetorId(Long setorId);
}