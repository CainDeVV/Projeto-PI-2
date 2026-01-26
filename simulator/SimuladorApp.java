import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Random;

public class SimuladorApp {

    // URL do Backend dentro da rede Docker
    private static final String BACKEND_URL = "http://backend:8080/api/driver/status";
    
    // Configurações da Impressora Simulada
    // deve ser IGUAL ao que está no DataSeeder.java
    private static final String SERIAL = "HP-LaserJet-1020"; 

    public static void main(String[] args) throws InterruptedException {
        System.out.println(">>> INICIANDO DRIVER SIMULADO (Lógica do Humberto) <<<");
        System.out.println("Dispositivo: " + SERIAL);

        Random random = new Random();
        HttpClient client = HttpClient.newHttpClient();

        int nivelTinta = 100;
        int contadorPaginas = 1500; 
        String status = "Online";

        // Loop Infinito (simula o equipamento ligado)
        while (true) {
            try {
                // "Chance de 5% de ocorrer um erro."
                boolean temErro = false;
                if (random.nextInt(100) < 5) {
                    temErro = true;
                    // Gera um código de erro aleatório como ele fez
                    String codigoErro = "ERR-" + (random.nextInt(900) + 100);
                    status = "Erro - " + codigoErro; 
                    System.out.println("[SIMULADOR] Ocorreu uma falha aleatória: " + status);
                } else {
                    status = "Online";
                }

                if (!temErro && nivelTinta > 0) {
                    
                    int gasto = random.nextInt(5) + 1; 
                    nivelTinta = Math.max(0, nivelTinta - gasto); 

                    // "Contador de páginas + random até 10 folhas"
                    contadorPaginas += random.nextInt(10);

                    System.out.println("[SIMULADOR] 🖨️ Imprimindo... Tinta: " + nivelTinta + "% | Pgs: " + contadorPaginas);
                } 
                else if (nivelTinta <= 0) {
                    status = "Offline - Sem Tinta";
                    System.out.println("[SIMULADOR] 🛑 Acabou a tinta!");
                }

                String json = String.format("""
                    {
                        "serial": "%s",
                        "nivelTinta": %d,
                        "contador": %d,
                        "status": "%s"
                    }
                """, SERIAL, nivelTinta, contadorPaginas, status);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BACKEND_URL))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .build();

                // Envia e ignora a resposta (Fire and forget)
                client.send(request, HttpResponse.BodyHandlers.ofString());

            } catch (Exception e) {
                // Se o backend estiver desligado, o simulador continua tentando
                System.err.println("[ERRO DE CONEXÃO] Tentando reconectar ao Backend...");
            }
            Thread.sleep(10000);
        }
    }
}