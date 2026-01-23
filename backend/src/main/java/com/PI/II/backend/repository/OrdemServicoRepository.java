package com.PI.II.backend.repository;

import com.PI.II.backend.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {
    
    // Busca todas as O.S. com status "Aberto"
    List<OrdemServico> findByStatus(String status);
}