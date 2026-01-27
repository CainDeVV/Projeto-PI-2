# Projeto Integrador II – Sistema de Monitoramento e Gestão de Equipamentos

Este projeto foi desenvolvido no contexto da disciplina **Projeto Integrador II**, do curso de **Ciência da Computação** da **Universidade Federal do Ceará (UFC) – Campus Crateús**.

O sistema proposto tem como finalidade oferecer uma solução integrada para o **monitoramento, gerenciamento e manutenção de computadores e impressoras**, permitindo maior controle operacional, rastreabilidade das ações técnicas e suporte à tomada de decisão por equipes de TI.

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
- Identificação de erros críticos simulados (ex: falta de tinta, papel atolado)

### Ordens de Serviço
- Abertura de Ordens de Serviço
- Atualização de status
- Fechamento de Ordens de Serviço
- Registro de histórico das intervenções

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
- Data e hora precisa do evento
- Descrição da ação executada
- Identificação do equipamento afetado (quando aplicável)

Esses logs permitem:
- Rastreabilidade completa das operações
- Identificação de falhas operacionais
- Suporte à conformidade com boas práticas de governança de TI

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

A utilização de containers garante que o sistema possa ser executado **independentemente do ambiente**, sem a necessidade de instalação manual de dependências como Java ou Node.js.

---

## Execução do Projeto com Docker

### Pré-requisitos
- Docker instalado
- Docker Compose instalado

> Não é necessário ter Java, Node ou PostgreSQL instalados localmente.

---
Como rodar:
Tenha o docker instalado, abra o docker

# Construir o sistema
docker-compose up --build -d

# Acessar o site
http://localhost:3000/

Admin:
Login: 081.887.593-33
Senha: 123

Técnico:
Login: 693.082.880-74
Senha: 123

Usuário Comum:
Login: 191.225.020-92
Senha: 123

# Derrubar o sistema
docker-compose down -v

Ctrl+f5 para limpar o cache

### Passo a Passo para Execução

1. Clone o repositório:
```bash
git clone https://github.com/CainDeW/Projeto-PI-2.git
