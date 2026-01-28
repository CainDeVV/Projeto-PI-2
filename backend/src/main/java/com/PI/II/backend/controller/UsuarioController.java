package com.PI.II.backend.controller;

import com.PI.II.backend.dto.LoginRequest;
import com.PI.II.backend.dto.LoginResponse;
import com.PI.II.backend.dto.UsuarioCreateDTO; // Importe o DTO novo
import com.PI.II.backend.model.Setor;
import com.PI.II.backend.model.Usuario;
import com.PI.II.backend.repository.SetorRepository;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private SetorRepository setorRepo;

    // 1. LISTAR TODOS
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepo.findAll();
    }

    // 2. BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return usuarioRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. SALVAR / EDITAR
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody UsuarioCreateDTO dados) {
        try {
            Usuario usuario;

            // Verifica se é Edição ou Criação
            if (dados.id() != null) {
                Optional<Usuario> existente = usuarioRepo.findById(dados.id());
                if (existente.isPresent()) {
                    usuario = existente.get();
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                usuario = new Usuario();
                // Validação de CPF duplicado na criação
                if (usuarioRepo.findByCpf(dados.cpf()).isPresent()) {
                    return ResponseEntity.badRequest().body("Erro: CPF já cadastrado!");
                }
            }

            // Preenche os dados básicos
            usuario.setNome(dados.nome());
            usuario.setCpf(dados.cpf());
            usuario.setTipo(dados.tipo());

            // Só atualiza a senha se ela foi enviada
            if (dados.senha() != null && !dados.senha().isEmpty()) {
                usuario.setSenha(dados.senha());
            }

            // Converte id_setor em Objeto Setor
            if (dados.id_setor() != null) {
                Setor setor = setorRepo.findById(dados.id_setor())
                        .orElseThrow(() -> new RuntimeException("Setor não encontrado"));
                usuario.setSetor(setor);
            }

            Usuario salvo = usuarioRepo.save(usuario);
            return ResponseEntity.ok(salvo);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar usuário: " + e.getMessage());
        }
    }
    
    // O Front chama PUT se tiver ID
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody UsuarioCreateDTO dados) {
        // Reutilizamos a lógica do salvar, pois ela já trata edição se tiver ID
        return salvar(new UsuarioCreateDTO(id, dados.nome(), dados.cpf(), dados.senha(), dados.tipo(), dados.id_setor()));
    }

    // 4. EXCLUIR
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!usuarioRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // 5. LOGIN
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dadosLogin) {
        Optional<Usuario> usuarioEncontrado = usuarioRepo.findByCpf(dadosLogin.cpf());

        if (usuarioEncontrado.isPresent()) {
            Usuario user = usuarioEncontrado.get();
            if (user.getSenha().equals(dadosLogin.senha())) {
                LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getNome(),
                    user.getTipo(),
                    "token-falso-para-aprovacao"
                );
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("CPF ou Senha inválidos!");
    }
}