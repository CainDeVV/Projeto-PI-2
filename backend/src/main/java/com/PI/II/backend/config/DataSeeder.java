package com.PI.II.backend.config;

import com.PI.II.backend.model.*;
import com.PI.II.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
            CidadeRepository cidadeRepo
    ) {
        return args -> {
            System.out.println("[DEBUG] Verificando banco de dados...");
            
            // 1. CIDADE (Se não existir, cria)
            Cidade cidade = new Cidade();
            cidade.setNome("Crateús");
            cidade.setEstado("CE");
            // Truque pra pegar a cidade salva ou criar nova
            if (cidadeRepo.count() == 0) cidadeRepo.save(cidade);
            Cidade cidadeSalva = cidadeRepo.findAll().get(0);

            // 2. EMPRESA
            Empresa empresa = new Empresa();
            empresa.setNome("Prefeitura de Crateús");
            empresa.setCnpj("00.000.000/0001-00");
            empresa.setCidade(cidadeSalva); 
            if (empresaRepo.count() == 0) empresaRepo.save(empresa);
            Empresa empresaSalva = empresaRepo.findAll().get(0);

            // 3. SETORES
            if (setorRepo.count() == 0) {
                Setor setorTI = new Setor();
                setorTI.setNome("TI - Suporte");
                setorTI.setEmpresa(empresaSalva);
                
                Setor setorRH = new Setor();
                setorRH.setNome("Recursos Humanos");
                setorRH.setEmpresa(empresaSalva);
                setorRepo.saveAll(List.of(setorTI, setorRH));
            }
            List<Setor> setoresSalvos = setorRepo.findAll();
            Setor setorTISalvo = setoresSalvos.get(0); // Pega o primeiro
            Setor setorRHSalvo = setoresSalvos.size() > 1 ? setoresSalvos.get(1) : setoresSalvos.get(0);

            // 4. COMPUTADORES
            System.out.println("[DataSeeder] Criando computadores...");
            for (int i = 1; i <= 5; i++) {
                Computador pc = new Computador();
                pc.setNome("PC-0" + i);
                pc.setModelo("Dell Optiplex");
                pc.setNumeroSerie("DELL-PC-" + i);
                pc.setSala("Sala 0" + i);
                pc.setStatus("Online");
                pc.setSetor(i % 2 == 0 ? setorRHSalvo : setorTISalvo); 
                
                if (!computadorRepo.existsByNumeroSerie(pc.getNumeroSerie())) {
                    computadorRepo.save(pc);
                }
            }

            // 5. USUÁRIOS
            Usuario admin = new Usuario();
            admin.setNome("Cainã Admin");
            admin.setCpf("000.000.000-00");
            admin.setSenha("123");
            admin.setTipo("ADMIN");
            admin.setSetor(setorTISalvo);

            Usuario tecnico = new Usuario();
            tecnico.setNome("João Técnico");
            tecnico.setCpf("111.111.111-11");
            tecnico.setSenha("123");
            tecnico.setTipo("TECNICO");
            tecnico.setSetor(setorTISalvo);

            if (usuarioRepo.findByCpf(admin.getCpf()).isEmpty()) usuarioRepo.save(admin);
            if (usuarioRepo.findByCpf(tecnico.getCpf()).isEmpty()) usuarioRepo.save(tecnico);

            // 6. IMPRESSORAS 
            System.out.println("[DataSeeder] Criando impressoras...");
            Impressora imp1 = new Impressora();
            imp1.setModelo("HP LaserJet");
            imp1.setNumeroSerie("HP-001");
            imp1.setSala("Sala TI");
            imp1.setTonel("80%"); 
            imp1.setContador("1500");
            imp1.setStatus("Online");
            imp1.setSetor(setorTISalvo);

            Impressora imp2 = new Impressora();
            imp2.setModelo("Epson EcoTank");
            imp2.setNumeroSerie("EPS-002");
            imp2.setSala("Recepção");
            imp2.setTonel("10%"); 
            imp2.setContador("5000");
            imp2.setStatus("Offline"); 
            imp2.setSetor(setorRHSalvo);

            if (!impressoraRepo.existsByNumeroSerie(imp1.getNumeroSerie())) impressoraRepo.save(imp1);
            if (!impressoraRepo.existsByNumeroSerie(imp2.getNumeroSerie())) impressoraRepo.save(imp2);

            // VERIFICAÇÃO FINAL
            System.out.println("[DataSeeder] Finalizado! PCs: " + computadorRepo.count() + " | Impressoras: " + impressoraRepo.count());
        };
    }
}