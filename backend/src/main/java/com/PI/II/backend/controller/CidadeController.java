package com.PI.II.backend.controller;

import com.PI.II.backend.model.Cidade;
import com.PI.II.backend.repository.CidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cidades")
@CrossOrigin(origins = "*")
public class CidadeController {

    @Autowired
    private CidadeRepository cidadeRepo;

    @GetMapping
    public List<Cidade> listar() {
        return cidadeRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<Cidade> salvar(@RequestBody Cidade cidade) {
        return ResponseEntity.ok(cidadeRepo.save(cidade));
    }
    
    // Deletar (Opcional por enquanto, mas bom ter)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        if(cidadeRepo.existsById(id)) {
            cidadeRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}