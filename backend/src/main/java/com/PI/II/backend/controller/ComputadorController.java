package com.PI.II.backend.controller;

import com.PI.II.backend.model.Computador;
import com.PI.II.backend.repository.ComputadorRepository;
import com.PI.II.backend.repository.OrdemServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/computadores")
@CrossOrigin(origins = "*") // 1. IMPORTANTE: Libera o acesso do Front
public class ComputadorController {

    @Autowired
    private ComputadorRepository computadorRepo;

    @Autowired
    private OrdemServicoRepository osRepo; // 2. IMPORTANTE: Para validar exclusão

    // LISTAR 
    @GetMapping
    public List<Computador> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long setorId
    ) {
        if (status != null && setorId != null) {
            return computadorRepo.findByStatusAndSetorId(status, setorId);
        } else if (status != null) {
            return computadorRepo.findByStatus(status);
        } else if (setorId != null) {
            return computadorRepo.findBySetorId(setorId);
        }
        return computadorRepo.findAll();
    }

    // CADASTRAR 
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Computador pc) {
        // Validação: Número de Série único
        if (computadorRepo.existsByNumeroSerie(pc.getNumeroSerie())) {
            return ResponseEntity.badRequest().body("Erro: Já existe um PC com este Número de Série!");
        }

        // Define status padrão se vier nulo
        if (pc.getStatus() == null || pc.getStatus().isEmpty()) {
            pc.setStatus("Online");
        }
        
        // Garante que o Setor foi enviado (Front as vezes manda nulo)
        if (pc.getSetor() == null) {
             return ResponseEntity.badRequest().body("Erro: É obrigatório selecionar um Setor.");
        }

        Computador novoPc = computadorRepo.save(pc);
        return ResponseEntity.ok(novoPc);
    }

    // 3. EDITAR 
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Computador dados) {
        return computadorRepo.findById(id).map(pc -> {
            if (dados.getNome() != null) pc.setNome(dados.getNome());
            if (dados.getModelo() != null) pc.setModelo(dados.getModelo());
            if (dados.getNumeroSerie() != null) pc.setNumeroSerie(dados.getNumeroSerie());
            if (dados.getSala() != null) pc.setSala(dados.getSala());
            if (dados.getSetor() != null) pc.setSetor(dados.getSetor()); 
            if (dados.getStatus() != null) pc.setStatus(dados.getStatus());

            Computador atualizado = computadorRepo.save(pc);
            return ResponseEntity.ok(atualizado);
        }).orElse(ResponseEntity.notFound().build());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Computador> buscarPorId(@PathVariable Long id) {
        return computadorRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EXCLUIR 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        return computadorRepo.findById(id).map(pc -> {
            
            // VERIFICAÇÃO DE SEGURANÇA: Se tiver O.S. Aberta, não deixa apagar
            boolean temOsAberta = osRepo.existsByComputadorAndStatus(pc, "Aberto");
            
            if (temOsAberta) {
                 return ResponseEntity.badRequest().body("Erro: Não é possível excluir um computador com O.S. Aberta!");
            }

            computadorRepo.delete(pc);
            return ResponseEntity.noContent().build();
            
        }).orElse(ResponseEntity.notFound().build());
    }
}