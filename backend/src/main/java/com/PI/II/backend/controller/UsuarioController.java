package com.PI.II.backend.controller;

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

    // SIMULAÇÃO DE LOGIN 
    // Recebe um JSON com cpf e senha. Retorna o Usuário se bater.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario dadosLogin) {
        Optional<Usuario> usuarioEncontrado = usuarioRepo.findByCpf(dadosLogin.getCpf());

        if (usuarioEncontrado.isPresent()) {
            Usuario user = usuarioEncontrado.get();
            if (user.getSenha().equals(dadosLogin.getSenha())) {
                return ResponseEntity.ok(user);
            }
        }
        
        return ResponseEntity.status(401).body("CPF ou Senha inválidos!");
    }
}