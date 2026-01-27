/* MANTENHA ASSIM NO SEU JAVA (LogErroController.java) */
package com.PI.II.backend.controller;

import com.PI.II.backend.model.LogErro;
import com.PI.II.backend.repository.LogErroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/log_erros") 
@CrossOrigin(origins = "*")
public class LogErroController {

    @Autowired
    private LogErroRepository logErroRepo;

    @GetMapping
    public List<LogErro> listar() {
        return logErroRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogErro> buscarPorId(@PathVariable Long id) {
        return logErroRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> resolver(@PathVariable Long id, @RequestBody LogErro dados) {
        return logErroRepo.findById(id).map(erro -> {
            if (dados.getResolvido() != null) {
                erro.setResolvido(dados.getResolvido());
            }
            logErroRepo.save(erro);
            return ResponseEntity.ok(erro);
        }).orElse(ResponseEntity.notFound().build());
    }
}