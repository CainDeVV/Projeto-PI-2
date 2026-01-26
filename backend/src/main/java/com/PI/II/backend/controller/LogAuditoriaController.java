package com.PI.II.backend.controller;

import com.PI.II.backend.model.LogAuditoria;
import com.PI.II.backend.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public ResponseEntity<LogAuditoria> salvar(@RequestBody LogAuditoria log) {
        if (log.getDataHora() == null) {
            log.setDataHora(LocalDateTime.now());
        }
        LogAuditoria salvo = logRepo.save(log);
        return ResponseEntity.ok(salvo);
    }

    @GetMapping
    public List<LogAuditoria> listar() {
        // Idealmente ordenaria por data descrescente, mas o findAll serve por enquanto
        return logRepo.findAll();
    }
}