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
@CrossOrigin(origins = "*") 
public class ImpressoraController {

    @Autowired
    private ImpressoraRepository impressoraRepo;

    @Autowired private OrdemServicoRepository osRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // --- LISTAR  ---
    @GetMapping
    public List<Impressora> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String modelo,
            @RequestParam(required = false) Long computadorId // Filtro PC
    ) {
        if (computadorId != null) {
            return impressoraRepo.findByComputadorId(computadorId);
        }

        // 2. Filtros de Status e Modelo
        if (status != null && modelo != null) {
            return impressoraRepo.findByStatusAndModelo(status, modelo);
        } else if (status != null) {
            return impressoraRepo.findByStatus(status);
        } else if (modelo != null) {
            return impressoraRepo.findByModelo(modelo);
        }
        
        // 3. Padrão: Retorna tudo
        return impressoraRepo.findAll();
    }

    // CADASTRAR
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Impressora imp) {
        if (impressoraRepo.existsByNumeroSerie(imp.getNumeroSerie())) {
            return ResponseEntity.badRequest().body("Erro: Já existe impressora com este Número de Série!");
        }

        // Defaults
        if (imp.getStatus() == null || imp.getStatus().isEmpty()) imp.setStatus("Online");
        if (imp.getTonel() == null || imp.getTonel().isEmpty()) imp.setTonel("100%");
        if (imp.getContador() == null || imp.getContador().isEmpty()) imp.setContador("0");
        
        // Validação de Setor
        if (imp.getSetor() == null) {
             return ResponseEntity.badRequest().body("Erro: É obrigatório selecionar um Setor.");
        }

        Impressora novaImp = impressoraRepo.save(imp);
        return ResponseEntity.ok(novaImp);
    }

    // ATUALIZAR 
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Impressora dados) {
        return impressoraRepo.findById(id).map(imp -> {
            
            // Atualiza campos
            if(dados.getStatus() != null) imp.setStatus(dados.getStatus());
            if(dados.getTonel() != null) imp.setTonel(dados.getTonel());
            if(dados.getContador() != null) imp.setContador(dados.getContador());
            if(dados.getModelo() != null) imp.setModelo(dados.getModelo());
            if(dados.getSala() != null) imp.setSala(dados.getSala());
            if(dados.getSetor() != null) imp.setSetor(dados.getSetor());
            if(dados.getNumeroSerie() != null) imp.setNumeroSerie(dados.getNumeroSerie()); // Adicionei caso queira corrigir série errada
            
            imp.setComputador(dados.getComputador());
            imp.setUsuario(dados.getUsuario());

            // AUTOMAÇÃO
            verificarSaudeDoEquipamento(imp);

            Impressora atualizada = impressoraRepo.save(imp);
            return ResponseEntity.ok(atualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Impressora> buscarPorId(@PathVariable Long id) {
        return impressoraRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EXCLUIR 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        return impressoraRepo.findById(id).map(imp -> {
            
            // VERIFICAÇÃO DE SEGURANÇA
            boolean temOsAberta = osRepo.existsByImpressoraAndStatus(imp, "Aberto");
            if (temOsAberta) {
                 return ResponseEntity.badRequest().body("Erro: Não é possível excluir impressora com O.S. Aberta!");
            }

            impressoraRepo.delete(imp);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    //MÉTODOS PRIVADOS

    private void verificarSaudeDoEquipamento(Impressora imp) {
        try {
            String tintaStr = imp.getTonel().replace("%", "").trim();
            int nivelTinta = Integer.parseInt(tintaStr);

            if (nivelTinta < 10) {
                abrirOsAutomatica(imp, "Tinta Crítica", "Nível de toner abaixo de 10%.", "Alta");
            }

            if (!imp.getStatus().equalsIgnoreCase("Online") && !imp.getStatus().equalsIgnoreCase("Manutenção")) {
                abrirOsAutomatica(imp, "Erro de Hardware", "Status reportado: " + imp.getStatus(), "Alta");
            }
        } catch (Exception e) { 
            // Ignora erro de parse
        }
    }

    private void abrirOsAutomatica(Impressora imp, String titulo, String descricao, String prioridade) {
        if (osRepo.existsByImpressoraAndStatus(imp, "Aberto")) return;

        OrdemServico os = new OrdemServico();
        os.setTitulo("[AUTO] " + titulo);
        os.setDescricaoProblema(descricao);
        os.setPrioridade(prioridade);
        os.setImpressora(imp);
        os.setSetor(imp.getSetor());
        os.setStatus("Aberto"); // Garante status inicial
        
        List<Usuario> admins = usuarioRepo.findAll();
        if (!admins.isEmpty()) os.setSolicitante(admins.get(0));

        osRepo.save(os);
    }
}