package com.PI.II.backend.controller;

import com.PI.II.backend.dto.DriverStatusRequest;
import com.PI.II.backend.model.*;
import com.PI.II.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    @Autowired
    private LogErroRepository logErroRepo;

    @Autowired
    private OrdemServicoRepository osRepo;

    @Autowired
    private UsuarioRepository usuarioRepo; // Para atribuir a O.S. ao Admin/Sistema

    // Endpoint que o Simulador chama
    @PostMapping("/status")
    public ResponseEntity<?> receberAtualizacaoHardware(@RequestBody DriverStatusRequest dados) {
        
        System.out.println("[DRIVER] Recebendo: " + dados.serial() + " | Status: " + dados.status());

        // 1. Busca a impressora
        Optional<Impressora> impressoraOpt = impressoraRepo.findByNumeroSerie(dados.serial());

        if (impressoraOpt.isPresent()) {
            Impressora imp = impressoraOpt.get();

            // 2. Atualiza Hardware (Estado Atual)
            imp.setTonel(dados.nivelTinta() + "%");
            imp.setContador(dados.contador() + " pgs");
            imp.setStatus(dados.status());
            impressoraRepo.save(imp);

            // 3. ANÁLISE DE INTELIGÊNCIA (Logs e O.S.)
            processarEventos(imp, dados.status());

            return ResponseEntity.ok().body("Sincronizado: " + imp.getModelo());
        }

        return ResponseEntity.status(404).body("Dispositivo desconhecido: " + dados.serial());
    }

    /**
     * O Cérebro da automação: Decide se gera Log ou abre O.S.
     */
    private void processarEventos(Impressora imp, String statusBruto) {
        // Ignora status "Online" (saudável) para não lotar o banco
        if ("Online".equalsIgnoreCase(statusBruto)) {
            return;
        }

        String severidade = "Info";
        boolean precisaDeOS = false;

        // Classifica a Severidade baseada na string do Simulador
        if (statusBruto.contains("Erro") || statusBruto.contains("Offline") || statusBruto.contains("Sem Tinta")) {
            severidade = "Crítico";
            precisaDeOS = true; // Erros críticos exigem O.S.
        } else if (statusBruto.contains("Alerta") || statusBruto.contains("Baixo")) {
            severidade = "Alerta";
            // Alertas não abrem O.S. automática, apenas Log
        }

        // 4. Cria o Log de Erro (Para o Monitoramento/Dashboard)
        LogErro log = new LogErro();
        log.setDataHora(LocalDateTime.now());
        log.setSeveridade(severidade);
        log.setTitulo("Alerta de Hardware: " + statusBruto);
        log.setDescricao("O driver reportou um problema automático. Nível de Toner: " + imp.getTonel());
        log.setCodigoErro(statusBruto.toUpperCase().replace(" ", "_"));
        log.setResolvido(false);
        
        // Vínculos para o Frontend
        log.setEquipamentoNome(imp.getModelo());
        log.setEquipamentoSala(imp.getSala());
        log.setIdEquipamentoAlvo(imp.getId());
        log.setImpressora(imp);

        // Salva o log
        logErroRepo.save(log);

        // 5. Abertura Automática de Chamado (Se Crítico)
        if (precisaDeOS) {
            verificarEAbirChamado(imp, statusBruto);
        }
    }

    private void verificarEAbirChamado(Impressora imp, String problema) {
        // Regra de Negócio: Não abrir O.S. se já tiver uma "Aberto" para essa impressora
        boolean jaTemChamado = osRepo.existsByImpressoraAndStatus(imp, "Aberto");

        if (!jaTemChamado) {
            System.out.println(">>> [AUTO-OS] Abrindo chamado automático para: " + imp.getModelo());

            OrdemServico os = new OrdemServico();
            os.setTitulo("Falha Crítica Automática: " + problema);
            os.setDescricaoProblema("O sistema de monitoramento detectou uma falha crítica enviada pelo driver. Verifique o equipamento imediatamente.");
            os.setPrioridade("Alta");
            os.setStatus("Aberto");
            os.setDataAbertura(LocalDateTime.now());
            
            os.setImpressora(imp);
            os.setSetor(imp.getSetor()); // O.S. fica no setor da impressora

            // Tenta achar um "Solicitante" (O sistema ou um Admin)
            // Aqui pegamos o primeiro usuário ADMIN que acharmos, ou null
            Usuario sistemaUser = usuarioRepo.findAll().stream()
                    .filter(u -> "ADMIN".equalsIgnoreCase(u.getTipo()))
                    .findFirst()
                    .orElse(null);
            
            os.setSolicitante(sistemaUser);

            osRepo.save(os);
        } else {
            System.out.println(">>> [AUTO-OS] Já existe chamado aberto para " + imp.getModelo() + ". Ignorando.");
        }
    }
}