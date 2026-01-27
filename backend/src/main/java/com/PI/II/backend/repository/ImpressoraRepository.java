package com.PI.II.backend.repository;

import com.PI.II.backend.model.Impressora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImpressoraRepository extends JpaRepository<Impressora, Long> {

    Optional<Impressora> findByNumeroSerie(String numeroSerie);

    boolean existsByNumeroSerie(String numeroSerie);

    // FILTROS DE STATUS/MODELO
    List<Impressora> findByStatusAndModelo(String status, String modelo);

    List<Impressora> findByStatus(String status);

    List<Impressora> findByModelo(String modelo);

    List<Impressora> findByComputadorId(Long computadorId);

    List<Impressora> findBySetorId(Long setorId);
}