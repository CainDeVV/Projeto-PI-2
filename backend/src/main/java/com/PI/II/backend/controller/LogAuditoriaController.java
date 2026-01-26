package com.PI.II.backend.controller;

import com.PI.II.backend.model.LogAuditoria;
import com.PI.II.backend.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort; // Importante para ordenação
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/logs")
@CrossOrigin(origins = "*")
public class LogAuditoriaController {

    @Autowired
    private LogAuditoriaRepository logRepo;

    // LISTAR
    @GetMapping
    public List<LogAuditoria> listar() {
        return logRepo.findAll(Sort.by(Sort.Direction.DESC, "dataHora"));
    }

    // SALVAR
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody LogAuditoria log) {
        try {
            if (log.getDataHora() == null) {
                log.setDataHora(LocalDateTime.now());
            }
            
            LogAuditoria salvo = logRepo.save(log);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar log: " + e.getMessage());
        }
    }
}