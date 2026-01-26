package com.PI.II.backend.repository;

import com.PI.II.backend.model.Impressora;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; 

public interface ImpressoraRepository extends JpaRepository<Impressora, Long> {

    Optional<Impressora> findByNumeroSerie(String numeroSerie);

    boolean existsByNumeroSerie(String numeroSerie);

    // Filtros
    List<Impressora> findByStatusAndModelo(String status, String modelo);
    
    List<Impressora> findByStatus(String status);
    
    List<Impressora> findByModelo(String modelo);
}