package com.PI.II.backend.controller;

import com.PI.II.backend.dto.SetorCreateDTO;
import com.PI.II.backend.model.Empresa;
import com.PI.II.backend.model.Setor;
import com.PI.II.backend.repository.ComputadorRepository;
import com.PI.II.backend.repository.EmpresaRepository;
import com.PI.II.backend.repository.ImpressoraRepository;
import com.PI.II.backend.repository.SetorRepository;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/setores")
@CrossOrigin(origins = "*")
public class SetorController {

    @Autowired private SetorRepository setorRepo;
    @Autowired private EmpresaRepository empresaRepo;
    
    // Repositórios para validação de exclusão
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ComputadorRepository pcRepo;
    @Autowired private ImpressoraRepository impRepo;

    // 1. LISTAR (Já existia, mantido)
    @GetMapping
    public List<Setor> listarTodos() {
        return setorRepo.findAll();
    }

    // 2. BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Setor> buscarPorId(@PathVariable Long id) {
        return setorRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. SALVAR / EDITAR
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody SetorCreateDTO dados) {
        try {
            Setor setor;

            // Lógica de Edição vs Criação
            if (dados.id() != null) {
                Optional<Setor> existente = setorRepo.findById(dados.id());
                if (existente.isPresent()) {
                    setor = existente.get();
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                setor = new Setor();
            }

            // Preenche dados simples
            setor.setNome(dados.nome());
            setor.setLocalizacao(dados.localizacao());
            setor.setObservacao(dados.observacao());

            // Vínculo com Empresa
            if (dados.id_empresa() != null) {
                Empresa empresa = empresaRepo.findById(dados.id_empresa())
                        .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
                setor.setEmpresa(empresa);
            } else {
                return ResponseEntity.badRequest().body("Erro: O setor precisa pertencer a uma empresa.");
            }

            Setor salvo = setorRepo.save(setor);
            return ResponseEntity.ok(salvo);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar setor: " + e.getMessage());
        }
    }

    // PUT (Reaproveita o salvar)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody SetorCreateDTO dados) {
        return salvar(new SetorCreateDTO(id, dados.nome(), dados.localizacao(), dados.observacao(), dados.id_empresa()));
    }

    // 4. EXCLUIR (Com proteção de integridade)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!setorRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        // Antes de excluir, verifica se tem gente ou equipamento usando esse setor
        boolean temUsuarios = !usuarioRepo.findAll().stream().filter(u -> u.getSetor() != null && u.getSetor().getId().equals(id)).toList().isEmpty();
        // Nota: O jeito ideal seria criar métodos "existsBySetorId" nos repositórios, mas assim funciona rápido pro MVP.
        
        if (temUsuarios) {
            return ResponseEntity.badRequest().body("Não é possível excluir: Existem usuários vinculados a este setor.");
        }
        
        // Verifica Computadores
        boolean temPc = !pcRepo.findBySetorId(id).isEmpty();
        if (temPc) return ResponseEntity.badRequest().body("Não é possível excluir: Existem computadores neste setor.");

        // Verifica Impressoras (Precisa criar filtro no repo ou fazer via stream)
        // Vamos fazer via stream para não mexer em outro arquivo agora
        boolean temImp = !impRepo.findAll().stream().filter(i -> i.getSetor() != null && i.getSetor().getId().equals(id)).toList().isEmpty();
        if (temImp) return ResponseEntity.badRequest().body("Não é possível excluir: Existem impressoras neste setor.");

        setorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}