package com.PI.II.backend.controller;

import com.PI.II.backend.model.Computador;
import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.model.OrdemServico;
import com.PI.II.backend.model.Usuario;
import com.PI.II.backend.repository.ComputadorRepository;
import com.PI.II.backend.repository.ImpressoraRepository;
import com.PI.II.backend.repository.OrdemServicoRepository;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ordens-servico")
@CrossOrigin(origins = "*")
public class OrdemServicoController {

    @Autowired private OrdemServicoRepository osRepo;
    @Autowired private ComputadorRepository pcRepo;
    @Autowired private ImpressoraRepository impRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // 1. LISTAR
    @GetMapping
    public List<OrdemServico> listar() {
        return osRepo.findAllByOrderByStatusAscDataAberturaDesc();
    }

    // 2. BUSCAR POR ID (NOVO - Essencial para Edição)
    @GetMapping("/{id}")
    public ResponseEntity<OrdemServico> buscarPorId(@PathVariable Long id) {
        return osRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. ABRIR CHAMADO
    @PostMapping
    public ResponseEntity<?> abrirChamado(@RequestBody OrdemServico os) {
        try {
            os.setDataAbertura(LocalDateTime.now());
            os.setStatus("Aberto");
            
            // Valida Solicitante
            if (os.getSolicitante() == null || os.getSolicitante().getId() == null) {
                List<Usuario> usuarios = usuarioRepo.findAll();
                if (!usuarios.isEmpty()) os.setSolicitante(usuarios.get(0));
                else return ResponseEntity.badRequest().body("Erro: Solicitante obrigatório.");
            }

            // Regra: Equipamento em Manutenção
            atualizarStatusEquipamento(os, "Manutenção");

            OrdemServico novaOs = osRepo.save(os);
            return ResponseEntity.ok(novaOs);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao abrir chamado: " + e.getMessage());
        }
    }

    // 4. ATUALIZAR (NOVO - Essencial para salvar edições)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody OrdemServico dados) {
        return osRepo.findById(id).map(osExistente -> {
            
            if (dados.getDescricaoProblema() != null) osExistente.setDescricaoProblema(dados.getDescricaoProblema());
            if (dados.getPrioridade() != null) osExistente.setPrioridade(dados.getPrioridade());
            
            // Atualiza Técnico
            if (dados.getResponsavel() != null) osExistente.setResponsavel(dados.getResponsavel());

            // Se reabrir chamado manualmente
            if (dados.getStatus() != null && !dados.getStatus().equals(osExistente.getStatus())) {
                osExistente.setStatus(dados.getStatus());
                if ("Aberto".equals(dados.getStatus())) {
                    osExistente.setDataFechamento(null);
                    osExistente.setSolucao(null);
                    atualizarStatusEquipamento(osExistente, "Manutenção");
                }
            }

            return ResponseEntity.ok(osRepo.save(osExistente));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. FECHAR CHAMADO
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> fecharChamado(@PathVariable Long id, @RequestBody OrdemServico dadosDoFront) {
        return osRepo.findById(id).map(os -> {
            os.setStatus("Fechado");
            os.setDataFechamento(LocalDateTime.now());
            os.setSolucao(dadosDoFront.getSolucao() != null ? dadosDoFront.getSolucao() : "Finalizado.");
            
            // Regra: Equipamento Online
            atualizarStatusEquipamento(os, "Online");

            return ResponseEntity.ok(osRepo.save(os));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 6. DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (osRepo.existsById(id)) {
            osRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Helper
    private void atualizarStatusEquipamento(OrdemServico os, String novoStatus) {
        if (os.getComputador() != null && os.getComputador().getId() != null) {
            pcRepo.findById(os.getComputador().getId()).ifPresent(pc -> {
                pc.setStatus(novoStatus);
                pcRepo.save(pc);
            });
        } else if (os.getImpressora() != null && os.getImpressora().getId() != null) {
            impRepo.findById(os.getImpressora().getId()).ifPresent(imp -> {
                imp.setStatus(novoStatus);
                impRepo.save(imp);
            });
        }
    }
}