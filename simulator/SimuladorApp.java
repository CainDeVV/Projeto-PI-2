import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class SimuladorApp {

    // URL do Backend (garanta que o Docker esteja rodando)
    private static final String BACKEND_URL = "http://backend:8080/api/driver/status";
    
    // Lista de Impressoras para Simular (Devem bater com o DataSeeder)
    // Se você adicionar mais no banco, adicione aqui também.
    private static final String[] SERIAIS = {
        "KYO-999",      // RH
        "HP-REC-01",    // Recepção
        "HP-Laser",     // Teste Extra
        "EPSON-FIN"     // Teste Extra
    };

    public static void main(String[] args) {
        System.out.println("==========================================");
        System.out.println(">>> SIMULADOR DE DRIVERS 2.0 (CAOS TOTAL) <<<");
        System.out.println("   Gerenciando " + SERIAIS.length + " dispositivos simultaneamente.");
        System.out.println("==========================================");

        // Cria um pool de threads para rodar as impressoras em paralelo
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(SERIAIS.length);
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        // Inicializa uma tarefa para cada impressora
        for (String serial : SERIAIS) {
            VirtualPrinter printer = new VirtualPrinter(serial, client);
            // Cada impressora reporta a cada 5 a 10 segundos (aleatório para não ficar sincronizado)
            int delay = new Random().nextInt(5) + 5; 
            scheduler.scheduleAtFixedRate(printer, 0, delay, TimeUnit.SECONDS);
        }
    }

    // Classe interna que representa UMA impressora
    static class VirtualPrinter implements Runnable {
        private String serial;
        private HttpClient client;
        private Random random;
        
        // Estado da Impressora
        private int nivelTinta;
        private int contadorPaginas;
        private String status;

        public VirtualPrinter(String serial, HttpClient client) {
            this.serial = serial;
            this.client = client;
            this.random = new Random();
            
            // Estado Inicial Aleatório
            this.nivelTinta = random.nextInt(60) + 40; // Começa entre 40% e 100%
            this.contadorPaginas = random.nextInt(5000) + 1000;
            this.status = "Online";
        }

        @Override
        public void run() {
            try {
                atualizarEstado();
                enviarDados();
            } catch (Exception e) {
                System.err.println("[" + serial + "] Erro ao comunicar: " + e.getMessage());
            }
        }

        private void atualizarEstado() {
            // 1. Chance de Erro (Aumentei para 25% para testes)
            int sorteio = random.nextInt(100);

            if (sorteio < 15) { 
                // Erros Críticos (Vermelho no Dashboard)
                String[] errosCriticos = {"Atolamento de Papel", "Sem Papel", "Tampa Aberta", "Fusur Queimado"};
                String erro = errosCriticos[random.nextInt(errosCriticos.length)];
                status = "Erro - " + erro;
                
            } else if (sorteio < 25) {
                // Alertas (Amarelo no Dashboard)
                status = "Alerta - Aquecimento";
                
            } else {
                // Funcionamento Normal
                if (nivelTinta <= 0) {
                    status = "Offline - Sem Tinta";
                } else {
                    status = "Online";
                    // Se está online, imprime um pouco
                    imprimir();
                }
            }
        }

        private void imprimir() {
            // Gasta tinta e aumenta contador
            int paginasImpressas = random.nextInt(5) + 1;
            contadorPaginas += paginasImpressas;
            
            // Gasta tinta (0.5% a 2% por ciclo)
            int gastoTinta = random.nextInt(3); 
            nivelTinta = Math.max(0, nivelTinta - gastoTinta);
        }

        private void enviarDados() {
            // Monta o JSON
            String json = String.format("""
                {
                    "serial": "%s",
                    "nivelTinta": %d,
                    "contador": %d,
                    "status": "%s"
                }
            """, serial, nivelTinta, contadorPaginas, status);

            // Log no Console para você acompanhar
            String cor = status.contains("Erro") ? "\u001B[31m" : (status.contains("Online") ? "\u001B[32m" : "\u001B[33m");
            String reset = "\u001B[0m";
            System.out.printf("[%s] Status: %s%s%s | Tinta: %d%% | Pgs: %d%n", 
                serial, cor, status, reset, nivelTinta, contadorPaginas);

            // Envia para o Java
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BACKEND_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        }
    }
}