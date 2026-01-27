package com.PI.II.backend.config;

import com.PI.II.backend.model.*;
import com.PI.II.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepo,
            SetorRepository setorRepo,
            ComputadorRepository computadorRepo,
            ImpressoraRepository impressoraRepo,
            EmpresaRepository empresaRepo,
            CidadeRepository cidadeRepo,
            OrdemServicoRepository osRepo,
            LogErroRepository logErroRepo,
            LogAuditoriaRepository auditoriaRepo
    ) {
        return args -> {
            System.out.println(">>> [DataSeeder] POPULANDO BANCO DE DADOS (VERSÃO COMPLETA / SINCRONIZADA) <<<");

            // =================================================================================
            // 1. CIDADES
            // =================================================================================
            if (cidadeRepo.count() == 0) {
                Cidade c1 = new Cidade(); c1.setNome("Crateús"); c1.setEstado("CE");
                Cidade c2 = new Cidade(); c2.setNome("Ipu"); c2.setEstado("CE");
                cidadeRepo.saveAll(List.of(c1, c2));
            }
            List<Cidade> cidades = cidadeRepo.findAll();
            Cidade crateus = cidades.stream().filter(c -> c.getNome().equals("Crateús")).findFirst().get();
            Cidade ipu = cidades.stream().filter(c -> c.getNome().equals("Ipu")).findFirst().get();

            // =================================================================================
            // 2. EMPRESAS (Com Descrição e Observação preenchidas)
            // =================================================================================
            if (empresaRepo.count() == 0) {
                // Crateús
                Empresa emp1 = new Empresa(); 
                emp1.setNome("Prefeitura de Crateús"); 
                emp1.setCnpj("07.000.000/0001-99"); 
                emp1.setCidade(crateus);
                emp1.setDescricao("Sede do poder executivo municipal.");
                emp1.setObservacao("Acesso pela Rua Principal, portão A.");

                Empresa emp2 = new Empresa(); 
                emp2.setNome("Hospital São Lucas"); 
                emp2.setCnpj("12.345.678/0001-00"); 
                emp2.setCidade(crateus);
                emp2.setDescricao("Hospital de emergência e especialidades.");
                emp2.setObservacao("Funcionamento 24h. Área de carga e descarga nos fundos.");
                
                // Ipu
                Empresa emp3 = new Empresa(); 
                emp3.setNome("Escola Técnica de Ipu"); 
                emp3.setCnpj("98.765.432/0001-11"); 
                emp3.setCidade(ipu);
                emp3.setDescricao("Ensino técnico profissionalizante.");
                emp3.setObservacao("Laboratórios climatizados.");

                Empresa emp4 = new Empresa(); 
                emp4.setNome("Supermercado Ipuense"); 
                emp4.setCnpj("11.222.333/0001-99"); 
                emp4.setCidade(ipu);
                emp4.setDescricao("Comércio varejista de alimentos.");
                emp4.setObservacao("Alto fluxo de clientes aos sábados.");

                empresaRepo.saveAll(List.of(emp1, emp2, emp3, emp4));
            }
            List<Empresa> empresas = empresaRepo.findAll();
            Empresa prefeitura = empresas.stream().filter(e -> e.getNome().contains("Prefeitura")).findFirst().get();
            Empresa hospital = empresas.stream().filter(e -> e.getNome().contains("Hospital")).findFirst().get();
            Empresa escola = empresas.stream().filter(e -> e.getNome().contains("Escola")).findFirst().get();
            Empresa mercado = empresas.stream().filter(e -> e.getNome().contains("Supermercado")).findFirst().get();

            // =================================================================================
            // 3. SETORES (Com Localização e Observação)
            // =================================================================================
            if (setorRepo.count() == 0) {
                createSetor(setorRepo, "TI - Suporte", "Bloco A - Sala 10", "Acesso biométrico.", prefeitura);
                createSetor(setorRepo, "Recursos Humanos", "Bloco B - Térreo", "Atendimento 08h-14h.", prefeitura);
                createSetor(setorRepo, "Recepção Central", "Térreo - Entrada", "Monitoramento por câmeras.", hospital);
                createSetor(setorRepo, "UTI Adulto", "2º Andar", "Área estéril.", hospital);
                createSetor(setorRepo, "Laboratório de Informática", "Bloco C", "30 Máquinas.", escola);
                createSetor(setorRepo, "Frente de Caixa", "Salão de Vendas", "Caixas 01 a 10.", mercado);
                createSetor(setorRepo, "Financeiro", "Mezanino", "Acesso restrito.", mercado);
            }
            
            // Refs para vincular
            Setor setorTI = setorRepo.findAll().stream().filter(s -> s.getNome().contains("TI")).findFirst().get();
            Setor setorRH = setorRepo.findAll().stream().filter(s -> s.getNome().contains("Recursos")).findFirst().get();
            Setor setorUTI = setorRepo.findAll().stream().filter(s -> s.getNome().contains("UTI")).findFirst().get();
            Setor setorLab = setorRepo.findAll().stream().filter(s -> s.getNome().contains("Laboratório")).findFirst().get();
            Setor setorCaixa = setorRepo.findAll().stream().filter(s -> s.getNome().contains("Caixa")).findFirst().get();
            Setor setorFin = setorRepo.findAll().stream().filter(s -> s.getNome().contains("Financeiro")).findFirst().get();
            Setor setorRec = setorRepo.findAll().stream().filter(s -> s.getNome().contains("Recepção")).findFirst().get();

            // =================================================================================
            // 4. USUÁRIOS
            // =================================================================================
            if (usuarioRepo.count() == 0) {
                Usuario admin = new Usuario(); admin.setNome("Cainã Admin"); admin.setCpf("081.887.593-33"); admin.setSenha("123"); admin.setTipo("ADMIN"); admin.setSetor(setorTI);
                Usuario tecnico = new Usuario(); tecnico.setNome("João Técnico"); tecnico.setCpf("693.082.880-74"); tecnico.setSenha("123"); tecnico.setTipo("TECNICO"); tecnico.setSetor(setorTI);
                Usuario maria = new Usuario(); maria.setNome("Maria do RH"); maria.setCpf("111.111.111-11"); maria.setSenha("123"); maria.setTipo("Comum"); maria.setSetor(setorRH);
                Usuario drPedro = new Usuario(); drPedro.setNome("Dr. Pedro"); drPedro.setCpf("222.222.222-22"); drPedro.setSenha("123"); drPedro.setTipo("Comum"); drPedro.setSetor(setorUTI);
                Usuario profAna = new Usuario(); profAna.setNome("Prof. Ana"); profAna.setCpf("333.333.333-33"); profAna.setSenha("123"); profAna.setTipo("Comum"); profAna.setSetor(setorLab);
                Usuario luizCaixa = new Usuario(); luizCaixa.setNome("Luiz Operador"); luizCaixa.setCpf("444.444.444-44"); luizCaixa.setSenha("123"); luizCaixa.setTipo("Comum"); luizCaixa.setSetor(setorCaixa);

                usuarioRepo.saveAll(List.of(admin, tecnico, maria, drPedro, profAna, luizCaixa));
            }
            
            Usuario uAdmin = usuarioRepo.findByCpf("081.887.593-33").get();
            Usuario uTecnico = usuarioRepo.findByCpf("693.082.880-74").get();
            Usuario uProf = usuarioRepo.findByCpf("333.333.333-33").get();
            Usuario uCaixa = usuarioRepo.findByCpf("444.444.444-44").get();
            Usuario uMedico = usuarioRepo.findByCpf("222.222.222-22").get();
            Usuario uMaria = usuarioRepo.findByCpf("111.111.111-11").get();

            // =================================================================================
            // 5. EQUIPAMENTOS (PCs e Impressoras)
            // =================================================================================
            if (computadorRepo.count() == 0) {
                // Crateús
                createPC(computadorRepo, "SRV-AD-01", "Dell PowerEdge", "SRV-001", "CPD", "Online", setorTI, uAdmin);
                createPC(computadorRepo, "PC-TEC-02", "Lenovo M720", "LEN-002", "Suporte", "Online", setorTI, uTecnico);
                createPC(computadorRepo, "PC-UTI-01", "HP All-in-One", "HP-UTI-01", "Leito 01", "Online", setorUTI, null); 
                createPC(computadorRepo, "PC-RH-01", "Dell Optiplex", "RH-PC-10", "Sala RH", "Online", setorRH, uMaria);
                
                // Ipu
                createPC(computadorRepo, "LAB-MASTER", "Dell Optiplex", "LAB-01", "Mesa Prof", "Online", setorLab, uProf);
                createPC(computadorRepo, "LAB-02", "Positivo", "LAB-02", "Bancada A", "Offline", setorLab, null);
                createPC(computadorRepo, "PDV-01", "Bematech", "PDV-001", "Caixa 01", "Online", setorCaixa, uCaixa);
                createPC(computadorRepo, "PC-FIN-01", "Lenovo", "FIN-01", "Escritório", "Online", setorFin, null);
            }
            
            // Computadores para vínculo com impressoras USB
            Computador pcProf = computadorRepo.findByNumeroSerie("LAB-01").orElse(null);
            Computador pcFin = computadorRepo.findByNumeroSerie("FIN-01").orElse(null);

            if (impressoraRepo.count() == 0) {
                // 1. KYO-999 (Simulador: RH)
                createImp(impressoraRepo, "Kyocera Ecosys M2040", "KYO-999", "Sala RH", "15%", "15400 pgs", "Online", setorRH, uMaria, null);
                
                // 2. HP-REC-01 (Simulador: Recepção)
                createImp(impressoraRepo, "HP Laser 107w", "HP-REC-01", "Recepção", "5%", "900 pgs", "Offline", setorRec, null, null);
                
                // 3. HP-Laser (Simulador: Teste Extra - Lab Escola)
                createImp(impressoraRepo, "HP LaserJet Pro", "HP-Laser", "Laboratório", "80%", "5000 pgs", "Online", setorLab, uProf, pcProf);

                // 4. EPSON-FIN (Simulador: Teste Extra - Financeiro)
                createImp(impressoraRepo, "Epson EcoTank L3150", "EPSON-FIN", "Financeiro", "100%", "200 pgs", "Online", setorFin, null, pcFin);
                
                // 5. Impressora Fiscal (Caixa) - Não simulada mas presente no banco
                createImp(impressoraRepo, "Bematech MP-4200", "BEMA-FIS-01", "Caixa 01", "N/A", "99999", "Erro", setorCaixa, uCaixa, null);
            }

            // =================================================================================
            // 6. ORDENS DE SERVIÇO & LOGS
            // =================================================================================
            if (osRepo.count() == 0) {
                Impressora impRec = impressoraRepo.findByNumeroSerie("HP-REC-01").orElse(null);
                Computador pcLabOff = computadorRepo.findByNumeroSerie("LAB-02").orElse(null);

                // OS Fechada
                OrdemServico os1 = new OrdemServico();
                os1.setTitulo("Configurar Rede");
                os1.setDescricaoProblema("Configurar IP estático no servidor.");
                os1.setSolucao("IP 192.168.1.10 configurado.");
                os1.setPrioridade("Baixa");
                os1.setStatus("Fechado");
                os1.setDataAbertura(LocalDateTime.now().minusDays(20));
                os1.setDataFechamento(LocalDateTime.now().minusDays(19));
                os1.setSetor(setorTI);
                os1.setSolicitante(uAdmin);
                os1.setResponsavel(uTecnico);
                osRepo.save(os1);

                // OS Aberta - Impressora Recepção
                if(impRec != null) {
                    OrdemServico os2 = new OrdemServico();
                    os2.setTitulo("Impressora Falhando");
                    os2.setDescricaoProblema("Impressora da recepção aparece offline intermitentemente.");
                    os2.setPrioridade("Alta");
                    os2.setStatus("Aberto");
                    os2.setDataAbertura(LocalDateTime.now().minusHours(4));
                    os2.setSetor(setorRec);
                    os2.setSolicitante(uAdmin); // Admin abriu
                    os2.setImpressora(impRec);
                    osRepo.save(os2);
                }

                // OS Aberta - PC Aluno
                if(pcLabOff != null) {
                    OrdemServico os3 = new OrdemServico();
                    os3.setTitulo("PC não liga");
                    os3.setDescricaoProblema("Bancada A - PC 02 não dá vídeo.");
                    os3.setPrioridade("Média");
                    os3.setStatus("Aberto");
                    os3.setDataAbertura(LocalDateTime.now().minusDays(2));
                    os3.setSetor(setorLab);
                    os3.setSolicitante(uProf);
                    os3.setComputador(pcLabOff);
                    osRepo.save(os3);
                }
            }
            
            // A. Logs de Erro (Hardware)
            if (logErroRepo.count() == 0) {
                // Erro 1 - Rede (Sem equipamento específico, erro de infra)
                LogErro err1 = new LogErro();
                err1.setTitulo("Instabilidade Link Internet");
                err1.setDescricao("Perda de pacotes rota principal.");
                err1.setCodigoErro("NET-WARN-002");
                err1.setSeveridade("Alerta");
                err1.setDataHora(LocalDateTime.now().minusMinutes(45));
                logErroRepo.save(err1);
                
                // Erro 2 - Vinculado à Impressora da Recepção
                Impressora impRec = impressoraRepo.findByNumeroSerie("HP-REC-01").orElse(null);
                if(impRec != null) {
                    LogErro err2 = new LogErro();
                    err2.setTitulo("Falha de Conexão");
                    err2.setDescricao("Dispositivo não responde ao ping.");
                    err2.setCodigoErro("DEV-OFFLINE");
                    err2.setSeveridade("Crítico");
                    err2.setDataHora(LocalDateTime.now().minusHours(4));
                    err2.setImpressora(impRec);
                    // Preenche campos redundantes para facilitar leitura no front se necessário
                    err2.setEquipamentoNome(impRec.getModelo());
                    err2.setEquipamentoSala(impRec.getSala());
                    err2.setIdEquipamentoAlvo(impRec.getId());
                    
                    logErroRepo.save(err2);
                }
            }

            // B. Logs de Auditoria
            if (auditoriaRepo.count() == 0) {
                auditoriaRepo.save(createLogAuditoria("LOGIN", "Sistema", "Cainã Admin logou no painel.", uAdmin));
                auditoriaRepo.save(createLogAuditoria("UPDATE", "O.S.", "João Técnico assumiu O.S. #1.", uTecnico));
            }

            System.out.println(">>> [DataSeeder] BANCO SINCRONIZADO COM SIMULADOR! <<<");
        };
    }

    private void createSetor(SetorRepository repo, String nome, String loc, String obs, Empresa emp) {
        Setor s = new Setor();
        s.setNome(nome);
        s.setLocalizacao(loc);
        s.setObservacao(obs);
        s.setEmpresa(emp);
        repo.save(s);
    }

    private void createPC(ComputadorRepository repo, String nome, String modelo, String serial, 
                          String sala, String status, Setor setor, Usuario usuario) {
        if (!repo.existsByNumeroSerie(serial)) {
            Computador pc = new Computador();
            pc.setNome(nome);
            pc.setModelo(modelo);
            pc.setNumeroSerie(serial);
            pc.setSala(sala);
            pc.setStatus(status);
            pc.setSetor(setor);
            pc.setUsuario(usuario);
            repo.save(pc);
        }
    }

    private void createImp(ImpressoraRepository repo, String modelo, String serial, String sala, 
                           String ton, String cont, String status, Setor setor, Usuario usuario, Computador pc) {
        if (!repo.existsByNumeroSerie(serial)) {
            Impressora imp = new Impressora();
            imp.setModelo(modelo);
            imp.setNumeroSerie(serial);
            imp.setSala(sala);
            imp.setTonel(ton);
            imp.setContador(cont);
            imp.setStatus(status);
            imp.setSetor(setor);
            imp.setUsuario(usuario);
            imp.setComputador(pc);
            repo.save(imp);
        }
    }
    
    private LogAuditoria createLogAuditoria(String acao, String recurso, String detalhes, Usuario user) {
        LogAuditoria log = new LogAuditoria();
        log.setAcao(acao);
        log.setRecurso(recurso);
        log.setDetalhes(detalhes);
        log.setUsuario(user);
        log.setUsuarioNome(user.getNome());
        log.setDataHora(LocalDateTime.now().minusMinutes(new java.util.Random().nextInt(60)));
        return log;
    }
}