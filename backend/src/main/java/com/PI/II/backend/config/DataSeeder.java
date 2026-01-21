package com.PI.II.backend.config;

import com.PI.II.backend.model.*;
import com.PI.II.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List; // Import necessário para o List.of

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UsuarioRepository usuarioRepo,
            SetorRepository setorRepo,
            ComputadorRepository computadorRepo,
            ImpressoraRepository impressoraRepo,
            EmpresaRepository empresaRepo 
    ) {
        return args -> {
            // Se já tiver dados, não faz nada
            if (empresaRepo.count() > 0) return;

            System.out.println("[DataSeeder] Povoando o banco de dados...");

            // --- 1. CRIAR EMPRESA (Obrigatório antes de Setor) ---
            Empresa empresa = new Empresa();
            empresa.setNome("Prefeitura de Crateús");
            empresa.setCnpj("00.000.000/0001-00");
            empresa.setDescricao("Sede Principal");
            // Salva a empresa primeiro para gerar o ID
            empresaRepo.save(empresa);

            // --- 2. SETORES (Vinculados à Empresa) ---
            Setor setorTI = new Setor();
            setorTI.setNome("TI - Suporte");
            setorTI.setLocalizacao("Bloco A");
            setorTI.setEmpresa(empresa); 
            
            Setor setorRH = new Setor();
            setorRH.setNome("Recursos Humanos");
            setorRH.setLocalizacao("Bloco B");
            setorRH.setEmpresa(empresa); 
            

            setorRepo.saveAll(List.of(setorTI, setorRH));

            // --- 3. USUÁRIOS ---
            Usuario admin = new Usuario();
            admin.setNome("Kainã Admin");
            admin.setCpf("000.000.000-00");
            admin.setSenha("123");
            admin.setTipo("ADMIN");
            admin.setSetor(setorTI);
            admin.setEmpresa(empresa); 

            Usuario tecnico = new Usuario();
            tecnico.setNome("João Técnico");
            tecnico.setCpf("111.111.111-11");
            tecnico.setSenha("123");
            tecnico.setTipo("TECNICO");
            tecnico.setSetor(setorTI);
            tecnico.setEmpresa(empresa);

            usuarioRepo.saveAll(List.of(admin, tecnico));

            // --- 4. COMPUTADORES (5 PCs) ---
            for (int i = 1; i <= 5; i++) {
                Computador pc = new Computador();
                pc.setNome("PC-0" + i);
                pc.setModelo("Dell Optiplex");
                pc.setNumeroSerie("DELL-PC-" + i);
                pc.setSala("Sala 0" + i);
                pc.setStatus("Online");
                pc.setSetor(i % 2 == 0 ? setorRH : setorTI); 
                computadorRepo.save(pc);
            }

            // --- 5. IMPRESSORAS (Uma com erro pra testar dashboard) ---
            Impressora imp1 = new Impressora();
            imp1.setModelo("HP LaserJet");
            imp1.setNumeroSerie("HP-001");
            imp1.setSala("Sala TI");
            imp1.setTonel("80%"); 
            imp1.setContador("1500");
            imp1.setStatus("Online");
            imp1.setSetor(setorTI);

            Impressora imp2 = new Impressora();
            imp2.setModelo("Epson EcoTank");
            imp2.setNumeroSerie("EPS-002");
            imp2.setSala("Recepção");
            imp2.setTonel("10%"); 
            imp2.setContador("5000");
            imp2.setStatus("Offline"); 
            imp2.setSetor(setorRH);

            impressoraRepo.saveAll(List.of(imp1, imp2));

            System.out.println("[DataSeeder] Banco pronto com Sucesso!");
        };
    }
}