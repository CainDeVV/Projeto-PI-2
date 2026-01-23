package com.PI.II.backend.repository;

import com.PI.II.backend.model.Impressora;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImpressoraRepository extends JpaRepository<Impressora, Long> {

    // Validação de Duplicidade
    boolean existsByNumeroSerie(String numeroSerie);

    // Filtros para o RF14 (Status e Modelo)
    List<Impressora> findByStatusAndModelo(String status, String modelo);
    
    List<Impressora> findByStatus(String status);
    
    List<Impressora> findByModelo(String modelo);
}