package com.PI.II.backend.controller;

import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.repository.ImpressoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/impressoras")
public class ImpressoraController {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    // LISTAR (Com filtros opcionais de Status e Modelo)
    @GetMapping
    public List<Impressora> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String modelo
    ) {
        if (status != null && modelo != null) {
            return impressoraRepo.findByStatusAndModelo(status, modelo);
        } else if (status != null) {
            return impressoraRepo.findByStatus(status);
        } else if (modelo != null) {
            return impressoraRepo.findByModelo(modelo);
        }
        return impressoraRepo.findAll();
    }

    // CADASTRAR
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Impressora imp) {
        // 1. Validação de Serial Único
        if (impressoraRepo.existsByNumeroSerie(imp.getNumeroSerie())) {
            return ResponseEntity.badRequest().body("Erro: Já existe impressora com este Número de Série!");
        }

        // 2. Regra de Negócio: Valores Padrão (Se vier vazio, preenche)
        if (imp.getStatus() == null || imp.getStatus().isEmpty()) {
            imp.setStatus("Online");
        }
        if (imp.getTonel() == null || imp.getTonel().isEmpty()) {
            imp.setTonel("100%"); // Começa cheia
        }
        if (imp.getContador() == null || imp.getContador().isEmpty()) {
            imp.setContador("0"); // Começa zerada
        }

        Impressora novaImp = impressoraRepo.save(imp);
        return ResponseEntity.ok(novaImp);
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Impressora> buscarPorId(@PathVariable Long id) {
        return impressoraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EXCLUIR
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!impressoraRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        impressoraRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}