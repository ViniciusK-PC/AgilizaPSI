# Diagrama de Casos de Uso - AgilizaPSI

## Arquivos Gerados

✅ **DIAGRAMA_CASOS_USO.puml** - Arquivo fonte PlantUML  
✅ **DIAGRAMA_CASOS_USO.png** - Imagem PNG gerada automaticamente

## Como Usar

### Opção 1: Usar a Imagem PNG Gerada
A imagem PNG já foi gerada e está disponível em:
```
DIAGRAMA_CASOS_USO.png
```

Você pode usar esta imagem diretamente no seu artigo.

### Opção 2: Regenerar a Imagem
Se precisar regenerar a imagem, execute:
```bash
npm run generate-diagram
```

Ou diretamente:
```bash
node scripts/generate-use-case-diagram.js
```

### Opção 3: Gerar Manualmente Online
1. Acesse: http://www.plantuml.com/plantuml/uml/
2. Abra o arquivo `DIAGRAMA_CASOS_USO.puml`
3. Cole o conteúdo no site
4. Clique em "Submit"
5. Baixe a imagem em PNG ou SVG

## Estrutura do Diagrama

### Atores
- **Psicólogo** - Profissional que atende pacientes
- **Secretário(a)** - Assistente administrativo
- **Administrador** - Gerencia o sistema e clínicas
- **Paciente** - Usuário que agenda consultas

### Casos de Uso Principais

#### Psicólogo
- Autorizar Secretário(a)
- CRUD pacientes
- Consultar agenda
- Agendar, modificar e excluir sessões e consultas
- Anexar e visualizar Documentos/Laudos
- Acessar e editar Prontuário Eletrônico
- Gerenciar Pagamentos
- Chat com Pacientes
- Visualizar Relatórios
- Gerenciar Disponibilidade

#### Secretário(a)
- Consultar agenda
- CRUD pacientes
- Agendar, visualizar e modificar sessões e consultas
- Anexar e visualizar Documentos/Laudos

#### Administrador
- Gerenciar Clínicas
- Gerenciar Profissionais
- Gerenciar Usuários
- Visualizar Estatísticas Gerais
- Configurar Sistema

#### Paciente
- Agendar Consulta
- Visualizar Lembretes
- Acessar Sala Virtual
- Chat com Psicólogo
- Visualizar Histórico

## Relacionamentos

O diagrama mostra:
- **Associações** entre atores e casos de uso (linhas simples)
- **Dependências** entre casos de uso (linhas tracejadas com `<<include>>`)

## Personalização

Para modificar o diagrama:
1. Edite o arquivo `DIAGRAMA_CASOS_USO.puml`
2. Execute `npm run generate-diagram` para regenerar a imagem

## Notas para o Artigo

- **Título sugerido:** "Figura 1 - Diagrama de Casos de Uso da AgilizaPSI"
- **Legenda:** O diagrama mostra os atores (Psicólogo, Secretário, Administrador e Paciente) e suas interações com o sistema AgilizaPSI, incluindo funcionalidades de agendamento, prontuário eletrônico, pagamentos e comunicação.

---

**Data de Criação:** 2025  
**Versão:** 1.0

