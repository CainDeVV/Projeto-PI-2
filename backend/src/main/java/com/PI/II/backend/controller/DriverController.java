package com.PI.II.backend.controller;

import com.PI.II.backend.dto.DriverStatusRequest;
import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.repository.ImpressoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    // Endpoint que o Simulador vai chamar: POST http://localhost:8080/api/driver/status
    @PostMapping("/status")
    public ResponseEntity<?> receberAtualizacaoHardware(@RequestBody DriverStatusRequest dados) {
        
        System.out.println("[DRIVER] Recebendo dados para Serial: " + dados.serial());

        // 1. Busca a impressora pelo Número de Série
        Optional<Impressora> impressoraOpt = impressoraRepo.findByNumeroSerie(dados.serial());

        if (impressoraOpt.isPresent()) {
            Impressora imp = impressoraOpt.get();

            // 2. Atualiza os dados com o que veio do "Hardware"
            imp.setTonel(dados.nivelTinta() + "%");
            imp.setContador(dados.contador() + " pgs");
            imp.setStatus(dados.status());

            // 3. Salva no Postgres
            impressoraRepo.save(imp);

            return ResponseEntity.ok().body("Hardware atualizado com sucesso: " + imp.getModelo());
        }

        return ResponseEntity.status(404).body("Impressora não encontrada com Serial: " + dados.serial());
    }
}