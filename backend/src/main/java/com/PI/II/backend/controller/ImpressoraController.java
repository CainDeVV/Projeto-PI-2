package com.PI.II.backend.controller;

import com.PI.II.backend.model.Impressora;
import com.PI.II.backend.model.OrdemServico;
import com.PI.II.backend.model.Usuario;
import com.PI.II.backend.repository.ImpressoraRepository;
import com.PI.II.backend.repository.OrdemServicoRepository;
import com.PI.II.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/impressoras")
@CrossOrigin(origins = "*") // Importante para o Front não bloquear
public class ImpressoraController {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    // --- NOVAS DEPENDÊNCIAS PARA A AUTOMAÇÃO ---
    @Autowired private OrdemServicoRepository osRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // LISTAR (Seu código original mantido)
    @GetMapping
    public List<Impressora> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String modelo
    ) {
        if (status != null && modelo != null) {
            return impressoraRepo.findByStatusAndModelo(status, modelo);
        } else if (status != null) {
            return impressoraRepo.findByStatus(status);
        } else if (modelo != null) {
            return impressoraRepo.findByModelo(modelo);
        }
        return impressoraRepo.findAll();
    }

    // CADASTRAR (Seu código original mantido)
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Impressora imp) {
        if (impressoraRepo.existsByNumeroSerie(imp.getNumeroSerie())) {
            return ResponseEntity.badRequest().body("Erro: Já existe impressora com este Número de Série!");
        }

        if (imp.getStatus() == null || imp.getStatus().isEmpty()) {
            imp.setStatus("Online");
        }
        if (imp.getTonel() == null || imp.getTonel().isEmpty()) {
            imp.setTonel("100%"); // Começa cheia
        }
        if (imp.getContador() == null || imp.getContador().isEmpty()) {
            imp.setContador("0"); // Começa zerada
        }

        Impressora novaImp = impressoraRepo.save(imp);
        return ResponseEntity.ok(novaImp);
    }

    // --- NOVO MÉTODO: ATUALIZAR (ESSENCIAL PARA O SIMULADOR) ---
    @PutMapping("/{id}")
    public ResponseEntity<Impressora> atualizar(@PathVariable Long id, @RequestBody Impressora dados) {
        return impressoraRepo.findById(id).map(imp -> {
            
            // Atualiza apenas o que veio no JSON
            if(dados.getStatus() != null) imp.setStatus(dados.getStatus());
            if(dados.getTonel() != null) imp.setTonel(dados.getTonel());
            if(dados.getContador() != null) imp.setContador(dados.getContador());
            
            // --- AQUI ENTRA A INTELIGÊNCIA ARTIFICIAL (AUTOMATIZAÇÃO) ---
            verificarSaudeDoEquipamento(imp);
            // -------------------------------------------------------------

            Impressora atualizada = impressoraRepo.save(imp);
            return ResponseEntity.ok(atualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

    // BUSCAR POR ID (Seu código original mantido)
    @GetMapping("/{id}")
    public ResponseEntity<Impressora> buscarPorId(@PathVariable Long id) {
        return impressoraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EXCLUIR (Seu código original mantido)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!impressoraRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        impressoraRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void verificarSaudeDoEquipamento(Impressora imp) {
        try {
            // 1. Verificar Nível de Tinta (Remove o % para virar número)
            String tintaStr = imp.getTonel().replace("%", "").trim();
            int nivelTinta = Integer.parseInt(tintaStr);

            // Regra: Se tinta < 10%, abre chamado urgente
            if (nivelTinta < 10) {
                abrirOsAutomatica(imp, "Tinta Crítica", "Nível de toner abaixo de 10%. Solicitar compra.", "Alta");
            }

            // 2. Verificar Status de Erro (Se não for Online nem Manutenção)
            if (!imp.getStatus().equalsIgnoreCase("Online") && 
                !imp.getStatus().equalsIgnoreCase("Manutenção")) {
                
                abrirOsAutomatica(imp, "Erro de Hardware", "Impressora reportou status de erro: " + imp.getStatus(), "Alta");
            }

        } catch (NumberFormatException e) {
            // Ignora se a tinta não for numero válido
        }
    }

    private void abrirOsAutomatica(Impressora imp, String titulo, String descricao, String prioridade) {
        // Verifica se já existe chamado ABERTO para não criar duplicado (Anti-Spam)
        if (osRepo.existsByImpressoraAndStatus(imp, "Aberto")) {
            return; 
        }

        System.out.println("[AUTO-OS] Abrindo chamado automático para: " + imp.getModelo());

        OrdemServico os = new OrdemServico();
        os.setTitulo("[AUTO] " + titulo);
        os.setDescricaoProblema(descricao);
        os.setPrioridade(prioridade);
        os.setStatus("Aberto");
        
        // Relacionamentos
        os.setImpressora(imp);
        os.setSetor(imp.getSetor());

        List<Usuario> admins = usuarioRepo.findAll();
        if (!admins.isEmpty()) {
            os.setSolicitante(admins.get(0)); 
        }

        osRepo.save(os);
    }
}