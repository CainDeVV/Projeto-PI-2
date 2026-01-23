package com.PI.II.backend.controller;

import com.PI.II.backend.model.Computador;
import com.PI.II.backend.repository.ComputadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/computadores")
public class ComputadorController {

    @Autowired
    private ComputadorRepository computadorRepo;

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

        Computador novoPc = computadorRepo.save(pc);
        return ResponseEntity.ok(novoPc);
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
        if (!computadorRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        computadorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}