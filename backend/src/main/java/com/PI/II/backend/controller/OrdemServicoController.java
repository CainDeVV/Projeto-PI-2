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
@RequestMapping("/ordens-servico") // Padrão de mercado (plural). Se o front usar /os, mude aqui.
@CrossOrigin(origins = "*") // Evita erros de conexão com o Front
public class OrdemServicoController {

    @Autowired private OrdemServicoRepository osRepo;
    @Autowired private ComputadorRepository pcRepo;
    @Autowired private ImpressoraRepository impRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // 1. LISTAR (Ordenado por Abertos e Data)
    @GetMapping
    public List<OrdemServico> listar() {
        return osRepo.findAllByOrderByStatusAscDataAberturaDesc();
    }

    // 2. ABRIR CHAMADO
    @PostMapping
    public ResponseEntity<?> abrirChamado(@RequestBody OrdemServico os) {
        try {
            // Garante dados iniciais
            os.setDataAbertura(LocalDateTime.now());
            os.setStatus("Aberto");
            os.setDataFechamento(null);
            os.setSolucao(null);

            if (os.getSolicitante() == null || os.getSolicitante().getId() == null) {
                List<Usuario> usuarios = usuarioRepo.findAll();
                if (!usuarios.isEmpty()) {
                    os.setSolicitante(usuarios.get(0)); 
                } else {
                    return ResponseEntity.badRequest().body("Erro: É necessário informar um solicitante.");
                }
            }
            // --- REGRA DE NEGÓCIO: EQUIPAMENTO VAI PARA 'MANUTENÇÃO' ---
            if (os.getComputador() != null && os.getComputador().getId() != null) {
                Optional<Computador> pcOpt = pcRepo.findById(os.getComputador().getId());
                if (pcOpt.isPresent()) {
                    Computador pc = pcOpt.get();
                    pc.setStatus("Manutenção"); 
                    pcRepo.save(pc);
                    os.setComputador(pc); 
                }
            } else if (os.getImpressora() != null && os.getImpressora().getId() != null) {
                Optional<Impressora> impOpt = impRepo.findById(os.getImpressora().getId());
                if (impOpt.isPresent()) {
                    Impressora imp = impOpt.get();
                    imp.setStatus("Manutenção"); 
                    impRepo.save(imp);
                    os.setImpressora(imp); 
                }
            }

            OrdemServico novaOs = osRepo.save(os);
            return ResponseEntity.ok(novaOs);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao abrir chamado: " + e.getMessage());
        }
    }

    // 3. FECHAR CHAMADO
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> fecharChamado(@PathVariable Long id, @RequestBody OrdemServico dadosDoFront) {
        return osRepo.findById(id).map(os -> {
            
            // Atualiza dados da O.S.
            os.setStatus("Fechado");
            os.setDataFechamento(LocalDateTime.now());
            
            // Pega a solução que o usuário digitou no Front
            if (dadosDoFront.getSolucao() != null) {
                os.setSolucao(dadosDoFront.getSolucao());
            } else {
                os.setSolucao("Finalizado sem observações.");
            }

            //  REGRA DE NEGÓCIO: EQUIPAMENTO VOLTA A SER 'ONLINE'
            if (os.getComputador() != null) {
                Computador pc = os.getComputador();
                pc.setStatus("Online"); 
                pcRepo.save(pc);
            } else if (os.getImpressora() != null) {
                Impressora imp = os.getImpressora();
                imp.setStatus("Online");
                impRepo.save(imp);
            }

            osRepo.save(os);
            return ResponseEntity.ok(os);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. DELETAR (Opcional)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (osRepo.existsById(id)) {
            osRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}