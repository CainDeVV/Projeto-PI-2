package com.PI.II.backend.scheduler;

import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.model.LogErro;
import com.PI.II.backend.repository.ImpressoraRepository;
import com.PI.II.backend.repository.LogErroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
public class HardwareSimulator {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    @Autowired
    private LogErroRepository logErroRepo;

    private final Random random = new Random();

 
    // Consumo de Tinta Variável: Roda a cada 30 segundos (30000 ms) para testarmos rápido.
    @Scheduled(fixedRate = 10000)
    public void simularConsumoTinta() {
        List<Impressora> impressoras = impressoraRepo.findAll();

        for (Impressora imp : impressoras) {
            // Só gasta tinta se estiver Online
            if ("Online".equalsIgnoreCase(imp.getStatus())) {
                try {
                    // O banco salva como String "80%", converte pra número
                    String tintaTexto = imp.getTonel().replace("%", "").trim();
                    int nivelAtual = Integer.parseInt(tintaTexto);

                    // Se tiver tinta, gasta uma quantidade aleatória entre 1% e 5%
                    if (nivelAtual > 0) {
                        int gasto = random.nextInt(5) + 1; // Gera 1 a 5
                        int novoNivel = Math.max(0, nivelAtual - gasto); // Não deixa ficar negativo

                        imp.setTonel(novoNivel + "%");
                        
                        // contador de páginas
                        int contadorAtual = Integer.parseInt(imp.getContador().replace(" pgs", "").trim());
                        imp.setContador((contadorAtual + random.nextInt(10)) + " pgs"); // Imprimiu até 10 folhas

                        impressoraRepo.save(imp);
                        System.out.println("[SIMULADOR] Impressora " + imp.getModelo() + " tinta caiu para " + novoNivel + "%");
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Erro ao ler tinta da impressora ID: " + imp.getId());
                }
            }
        }
    }

    // Geração de Erros Aleatórios: Roda a cada 1 minuto (10000 ms) - Chance de 5% de ocorrer um erro.
    @Scheduled(fixedRate = 60000)
    public void simularErrosAleatorios() {
        // Se for menor que 5, gera erro.
        if (random.nextInt(100) < 5) {
            List<Impressora> impressoras = impressoraRepo.findByStatus("Online");
            
            if (!impressoras.isEmpty()) {
                // Escolhe uma impressora aleatória para dar defeito
                Impressora vitima = impressoras.get(random.nextInt(impressoras.size()));

                LogErro erro = new LogErro();
                erro.setTitulo("Falha de Hardware (Simulação)");
                erro.setDescricao("Sensor detectou atolamento de papel ou aquecimento.");
                erro.setCodigoErro("ERR-" + (random.nextInt(900) + 100)); // Ex: ERR-404
                erro.setSeveridade("Alerta");
                erro.setResolvido(false);
                erro.setDataHora(LocalDateTime.now());
                erro.setImpressora(vitima); // Vincula o erro à impressora

                logErroRepo.save(erro);
                System.out.println("[SIMULADOR] ERRO GERADO para: " + vitima.getModelo());
            }
        }
    }
}