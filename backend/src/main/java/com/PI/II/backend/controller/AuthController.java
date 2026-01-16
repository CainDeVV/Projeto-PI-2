package com.PI.II.backend.controller;

import com.PI.II.backend.dto.LoginRequest;
import com.PI.II.backend.dto.LoginResponse;
import com.PI.II.backend.model.Usuario;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // libera pro front acessar o back
public class AuthController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        
        Usuario usuario = repository.findByCpf(body.cpf())
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }

        // 3. Verifica a senha (No futuro usar BCrypt)
        if (!usuario.getSenha().equals(body.senha())) {
            return ResponseEntity.badRequest().body("Senha incorreta!");
        }

        LoginResponse resposta = new LoginResponse(
            usuario.getId(), 
            usuario.getNome(), 
            usuario.getTipo(),
            "token-falso-123"
        );

        return ResponseEntity.ok(resposta);
    }
    
    @PostMapping("/criar-teste")
    public ResponseEntity<?> criarUsuarioTeste(@RequestBody @NonNull Usuario novoUsuario) {
        repository.save(novoUsuario);
        return ResponseEntity.ok("Usuário criado com sucesso!");
    }
}