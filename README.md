# Projeto Integrador II – Sistema de Monitoramento e Gestão de Equipamentos

Este projeto foi desenvolvido no contexto da disciplina **Projeto Integrador II**, do curso de **Ciência da Computação** da **Universidade Federal do Ceará (UFC) – Campus Crateús**.

O sistema tem como finalidade oferecer uma solução integrada para o **monitoramento, gerenciamento e manutenção de computadores e impressoras**, permitindo maior controle operacional, rastreabilidade das ações técnicas e suporte à tomada de decisão por equipes de TI.

---

## Contexto do Problema

Organizações que dependem fortemente de computadores e impressoras enfrentam dificuldades recorrentes relacionadas à manutenção, monitoramento e controle desses dispositivos. Entre os principais problemas observados estão:

- Falta de uma visão centralizada do estado dos equipamentos  
- Manutenção reativa, baseada apenas em chamados manuais  
- Ausência de histórico de ações técnicas  
- Dificuldade em rastrear quem realizou determinadas operações  
- Perda de produtividade causada por falhas recorrentes  

Diante desse cenário, torna-se essencial um sistema capaz de **centralizar informações, registrar intervenções técnicas e fornecer dados confiáveis para auditoria e governança de TI**.

---

## Objetivo do Sistema

O objetivo principal do sistema é **monitorar e gerenciar computadores e impressoras de forma centralizada**, permitindo:

- Controle dos equipamentos cadastrados  
- Acompanhamento do estado operacional  
- Simulação de manutenção remota  
- Gerenciamento de Ordens de Serviço  
- Registro automático de logs de auditoria (RF16)  

---

## Funcionalidades Implementadas

### Gestão de Equipamentos
- Cadastro, listagem, atualização e exclusão de computadores  
- Cadastro, listagem, atualização e exclusão de impressoras  
- Associação de equipamentos a setores e empresas  

### Monitoramento de Impressoras
- Simulação de nível de tinta  
- Contador de páginas impressas  
- Identificação de erros críticos simulados (ex.: falta de tinta, papel atolado)  

### Ordens de Serviço
- Abertura de Ordens de Serviço  
- Atualização de status  
- Fechamento de Ordens de Serviço  
- Registro do histórico das intervenções  

### Logs de Auditoria (RF16)
- Registro automático de ações críticas  
- Rastreamento de exclusões de equipamentos  
- Registro de fechamento de Ordens de Serviço  
- Suporte à auditoria e governança de TI  

### Dashboard
- Visão geral do sistema  
- Indicadores de equipamentos  
- Exibição de erros e status operacionais  

---

## Segurança e Auditoria

O sistema implementa mecanismos de auditoria conforme o **Requisito Funcional RF16**, garantindo que todas as ações críticas sejam registradas automaticamente.

Cada registro de auditoria contém:
- Usuário responsável pela ação  
- Data e hora do evento  
- Descrição da ação executada  
- Identificação do equipamento afetado (quando aplicável)  

Esses registros permitem:
- Rastreabilidade completa das operações  
- Identificação de falhas operacionais  
- Suporte à governança de TI  

---

## Tecnologias Utilizadas

### Backend
- **Java 17**  
- **Spring Boot**  
- **Spring Data JPA**  
- **PostgreSQL**  

### Frontend
- **HTML**  
- **CSS**  
- **JavaScript**  

### Infraestrutura e DevOps
- **Docker**  
- **Docker Compose**  

O uso de containers garante que o sistema possa ser executado **independentemente do ambiente**, sem a necessidade de instalação manual de dependências.

---

## Execução do Projeto com Docker

### Pré-requisitos
- Docker instalado  
- Docker Desktop em execução  

> Não é necessário ter Java, Node.js ou PostgreSQL instalados localmente.

---

### Passo a Passo para Execução

#### 1. Clonar o repositório
```bash
git clone https://github.com/CainDeW/Projeto-PI-2.git
cd Projeto-PI-2
```
### 2. Construir e subir o sistema

Execute o comando abaixo na pasta onde está o docker-compose.yml:
docker-compose up --build -d

3. Acessar o sistema
Abra o navegador e acesse:
http://localhost:3000/

Credenciais de Acesso

Administrador
Login: 081.887.593-33
Senha: 123

Técnico
Login: 693.082.880-74
Senha: 123

Usuário Comum
Login: 191.225.020-92
Senha: 123

4. Derrubar o sistema
Para parar e remover os containers:
docker-compose down -v

Observação
Caso ocorram problemas de carregamento no navegador, utilize:
Ctrl + F5
para limpar o cache.
---
