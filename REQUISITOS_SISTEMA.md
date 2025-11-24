# Requisitos do Sistema - AgilizaPSI

## Tabela 1 - Requisitos do Sistema

| Código | Tipo | Descrição |
|--------|------|-----------|
| RF01 | Funcional | Diferentes Perfis de Usuários |
| RF02 | Funcional | Gerenciamento da Agenda |
| RF03 | Funcional | Gerenciamento de Pacientes |
| RF04 | Funcional | Prontuário Eletrônico |
| RF05 | Funcional | Anexo de Exames |
| RF06 | Funcional | Permissão de Acesso |
| RNF01 | Não Funcional | Dados e informações sensíveis criptografadas |
| RNF02 | Não Funcional | Sistema de recuperação dos dados |
| RNF03 | Não Funcional | Interface intuitiva e de fácil acesso |
| RNF04 | Não Funcional | Sistema escalável |
| RNF05 | Não Funcional | Documentação atualizada sobre o sistema |

---

## Detalhamento dos Requisitos Funcionais

### RF01 - Diferentes Perfis de Usuários
**Descrição:** O sistema deve suportar diferentes perfis de usuários com permissões e funcionalidades específicas.

**Perfis Implementados:**
- **ADMIN:** Acesso total ao sistema, gerenciamento de clínicas, profissionais e configurações gerais
- **PSICOLOGO:** Acesso ao dashboard profissional, agendamentos, pacientes, prontuários, mensagens e relatórios da sua clínica
- **USER (Paciente):** Acesso ao agendamento de consultas, visualização de lembretes, acesso à sala virtual e chat com psicólogos

**Isolamento por Clínica:**
- Cada profissional está vinculado a uma clínica específica
- Profissionais só visualizam dados (agendamentos, pacientes, mensagens, prontuários, pagamentos) da sua própria clínica
- Cada clínica opera de forma isolada, sem comunicação entre clínicas diferentes

### RF02 - Gerenciamento da Agenda
**Descrição:** Sistema completo de gerenciamento de agendamentos de consultas.

**Funcionalidades:**
- Criação, edição e cancelamento de agendamentos
- Visualização de agenda por profissional e por clínica
- Filtros por data, status (PENDING, CONFIRMED, COMPLETED, CANCELLED) e tipo (ONLINE, IN_PERSON)
- Agendamentos isolados por clínica - profissionais só veem agendamentos da sua clínica
- Lembretes automáticos para pacientes
- Integração com sala virtual para consultas online

### RF03 - Gerenciamento de Pacientes
**Descrição:** Sistema de gerenciamento de pacientes e seus dados.

**Funcionalidades:**
- Cadastro e edição de dados de pacientes
- Visualização de histórico de consultas por paciente
- Listagem de pacientes com agendamentos
- Isolamento por clínica - profissionais só veem pacientes que têm agendamentos com profissionais da mesma clínica
- Perfil completo do paciente com histórico de atendimentos

### RF04 - Prontuário Eletrônico
**Descrição:** Sistema de prontuário eletrônico para registro de informações clínicas.

**Funcionalidades:**
- Criação e edição de prontuários
- Vinculação de prontuários a agendamentos específicos
- Histórico completo de prontuários por paciente
- Isolamento por clínica - profissionais só acessam prontuários de pacientes da sua clínica
- Busca e filtros de prontuários

### RF05 - Anexo de Exames
**Descrição:** Sistema para anexar exames e documentos aos prontuários.

**Funcionalidades:**
- Upload de arquivos (exames, documentos)
- Vinculação de anexos a prontuários específicos
- Visualização e download de anexos
- Armazenamento seguro de documentos

### RF06 - Permissão de Acesso
**Descrição:** Sistema de controle de acesso baseado em perfis e clínicas.

**Funcionalidades:**
- Autenticação de usuários
- Controle de acesso por perfil (ADMIN, PSICOLOGO, USER)
- Isolamento de dados por clínica
- Validação de permissões em todas as operações
- Proteção de rotas e APIs baseada em sessão e perfil

---

## Detalhamento dos Requisitos Não Funcionais

### RNF01 - Dados e Informações Sensíveis Criptografadas
**Descrição:** Todos os dados sensíveis devem ser criptografados.

**Implementação:**
- Senhas criptografadas usando bcrypt
- Tokens de acesso seguros
- Comunicação HTTPS
- Dados sensíveis protegidos no banco de dados

### RNF02 - Sistema de Recuperação dos Dados
**Descrição:** Sistema deve possuir mecanismos de backup e recuperação de dados.

**Implementação:**
- Backup regular do banco de dados
- Sistema de logs para auditoria
- Recuperação de dados em caso de falhas

### RNF03 - Interface Intuitiva e de Fácil Acesso
**Descrição:** Interface deve ser intuitiva e de fácil uso para todos os perfis.

**Implementação:**
- Design responsivo e moderno
- Navegação clara e organizada
- Paleta de cores verde consistente
- Feedback visual para ações do usuário
- Mensagens de erro e sucesso claras

### RNF04 - Sistema Escalável
**Descrição:** Sistema deve ser capaz de crescer e suportar múltiplas clínicas e usuários.

**Implementação:**
- Arquitetura modular e escalável
- Suporte a múltiplas clínicas isoladas
- Banco de dados otimizado
- APIs RESTful para integração futura
- Estrutura preparada para crescimento

### RNF05 - Documentação Atualizada sobre o Sistema
**Descrição:** Sistema deve possuir documentação completa e atualizada.

**Implementação:**
- Documentação de código
- README com instruções de instalação
- Documentação de APIs
- Guias de uso para cada perfil

---

## Funcionalidades Adicionais Implementadas

### Sistema de Clínicas
- Cadastro e gerenciamento de clínicas
- Cada clínica possui configurações próprias
- Isolamento completo de dados entre clínicas
- Token de acesso único para cadastro de profissionais

### Sistema de Chat
- Comunicação entre pacientes e psicólogos
- Mensagens isoladas por clínica
- Notificações de mensagens não lidas
- Histórico de conversas

### Sistema Financeiro
- Gerenciamento de pagamentos
- Estatísticas financeiras por clínica
- Relatórios de receita
- Integração com PIX

### Sala Virtual
- Integração com Jitsi Meet
- Links de acesso para consultas online
- Gerenciamento de salas virtuais por agendamento

### Relatórios e Analytics
- Dashboard com métricas da clínica
- Relatórios de agendamentos
- Estatísticas de pacientes
- Análise financeira

---

**Data de Criação:** 2025
**Versão do Documento:** 1.0
**Última Atualização:** 2025


