package com.PI.II.backend.controller;

import com.PI.II.backend.dto.LoginRequest; 
import com.PI.II.backend.dto.LoginResponse; 
import com.PI.II.backend.model.Usuario;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepo;

    // LISTAR TODOS 
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepo.findAll();
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dadosLogin) {
        // Busca usuário pelo CPF
        Optional<Usuario> usuarioEncontrado = usuarioRepo.findByCpf(dadosLogin.cpf());

        if (usuarioEncontrado.isPresent()) {
            Usuario user = usuarioEncontrado.get();
            
            // Compara a senha
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