package com.PI.II.backend.controller;

import com.PI.II.backend.model.Cidade;
import com.PI.II.backend.model.Empresa;
import com.PI.II.backend.repository.CidadeRepository;
import com.PI.II.backend.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresas")
@CrossOrigin(origins = "*")
public class EmpresaController {

    @Autowired private EmpresaRepository empresaRepo;
    @Autowired private CidadeRepository cidadeRepo;

    @GetMapping
    public List<Empresa> listar() {
        return empresaRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Empresa empresa) {
        // O front manda { "cidade": { "id": 1 } } ou { "id_cidade": 1 }?
        // Vamos assumir que você ajustou o DTO ou o JSON. 
        // Para simplificar, vou permitir salvar direto se o objeto vier completo.
        return ResponseEntity.ok(empresaRepo.save(empresa));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        if(empresaRepo.existsById(id)) {
            empresaRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}