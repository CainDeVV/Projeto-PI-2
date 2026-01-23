package com.PI.II.backend.controller;

import com.PI.II.backend.model.OrdemServico;
import com.PI.II.backend.repository.OrdemServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/os")
public class OrdemServicoController {

    @Autowired
    private OrdemServicoRepository osRepo;

    // LISTAR TODAS
    @GetMapping
    public List<OrdemServico> listar() {
        return osRepo.findAll();
    }

    // ABRIR NOVA O.S.
    @PostMapping
    public ResponseEntity<OrdemServico> abrirChamado(@RequestBody OrdemServico os) {
        os.setDataAbertura(LocalDateTime.now());
        os.setStatus("Aberto");
        
        os.setDataFechamento(null);
        os.setSolucao(null);

        OrdemServico novaOs = osRepo.save(os);
        return ResponseEntity.ok(novaOs);
    }

    // FECHAR O.S.
    @PutMapping("/{id}/fechar")
    public ResponseEntity<?> fecharChamado(@PathVariable Long id, @RequestBody String solucaoTexto) {
        return osRepo.findById(id).map(os -> {
            os.setSolucao(solucaoTexto);
            os.setStatus("Concluído");
            os.setDataFechamento(LocalDateTime.now());
            
            osRepo.save(os);
            return ResponseEntity.ok(os);
        }).orElse(ResponseEntity.notFound().build());
    }
}