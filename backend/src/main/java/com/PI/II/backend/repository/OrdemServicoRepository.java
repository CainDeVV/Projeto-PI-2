package com.PI.II.backend.repository;

import com.PI.II.backend.model.Computador;
import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    // --- MÉTODOS DE LISTAGEM ---
    List<OrdemServico> findByStatus(String status);

    List<OrdemServico> findAllByOrderByStatusAscDataAberturaDesc();

    boolean existsByImpressoraAndStatus(Impressora impressora, String status);

   
    boolean existsByComputadorAndStatus(Computador computador, String status);
}