# Checklist QA Visual Premium — Easy-PLC / CLP Fácil

Este checklist deve ser usado para validar o pacote visual premium no celular e comparar o app com os mockups aprovados.

## 1. Preparação

Antes do teste, rodar:

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```

Se algum comando falhar, corrigir antes de avançar para refinamento visual.

## 2. Navegação principal

A navegação inferior deve exibir:

- Início
- Aprender
- Simular
- Projetos
- Editor
- Ref

Critérios:

- Não deve aparecer `Hardware` como nome da biblioteca de projetos.
- Não deve aparecer `Pro` apontando para Editor/Exportação.
- A aba ativa deve ter indicador visual claro.
- Em smartphone, os rótulos curtos devem caber sem quebrar layout.

## 3. Paleta visual

Todas as telas premium devem usar:

- fundo principal: `#020817` ou próximo;
- cards: `#07111F`, `#0B1220` ou `#111827`;
- bordas: `#1E293B` / `#334155`;
- texto principal: `#F8FAFC`;
- texto secundário: `#94A3B8`;
- acento principal: ciano/teal `#22D3EE`;
- ativo/sucesso/RUN: verde `#22C55E`;
- alerta/destaque: âmbar `#F59E0B`;
- avançado/especial: roxo `#A78BFA`.

Falha visual:

- fundo branco inesperado;
- azul padrão genérico fora da identidade;
- texto escuro sobre fundo escuro;
- card sem hierarquia;
- layout de desktop espremido no celular.

## 4. Tela Início

Abrir: `Início`.

Validar:

- aparece `Easy-PLC / CLP Fácil`;
- aparece chamada `Aprenda, simule e domine CLPs`;
- há cards de progresso, continuar aprendendo, ações rápidas, projetos recentes e exemplos prontos;
- o visual segue os mockups: escuro, técnico, limpo e premium;
- nada parece genérico ou branco.

## 5. Tela Aprender

Abrir: `Aprender`.

Validar:

- existem abas/trilhas: Trilhas, Módulos, Desafios e Conquistas;
- aparecem trilhas:
  - História do CLP;
  - Como o CLP funciona;
  - Pensamento Ladder;
  - Instruções essenciais;
  - Aplicações reais;
  - Diagnóstico;
- há card de lição atual;
- a tela comunica ensino guiado, não apenas lista estática.

## 6. Tela Simular

Abrir: `Simular`.

Validar:

- no celular, aparece entrada para execução mobile;
- ao abrir execução mobile, aparece `MobileExecutionCockpit`;
- o topo mostra Easy-PLC, RUN, AUTO e SCAN;
- existe navegação horizontal de I/O:
  - Entradas;
  - Saídas;
  - Memórias;
  - Timers;
  - Contadores;
- existem modos:
  - Lista;
  - Fluxo;
  - Rung compacto;
- no modo Rung compacto, a saída/carga fica visível no lado direito;
- o rodapé mostra Linha ativa, Saída e Último scan;
- a tela não fica poluída no smartphone.

## 7. Tela Projetos

Abrir: `Projetos`.

Validar:

- há busca visual;
- há filtros:
  - Todos;
  - Básico;
  - Intermediário;
  - Avançado;
  - Favoritos;
- há projeto em destaque;
- há cards para:
  - Partida direta;
  - Selo;
  - Reversão;
  - Estrela-triângulo;
  - Semáforo;
  - Bomba alternada;
  - Esteira;
  - Portão automático;
- cada card mostra dificuldade, rungs, timers/contadores quando aplicável e botão Abrir.

## 8. Tela Editor

Abrir: `Editor`.

Validar:

- existe alternância `Editor / Exportar`;
- no modo Editor, há toolbar:
  - NA;
  - NF;
  - COIL;
  - TON;
  - CTU;
  - Mais;
- a área Ladder é escura;
- rungs aparecem compactos;
- saída/carga fica visível;
- há comentário didático do rung;
- há ações Desfazer, Refazer e Excluir rung.

## 9. Exportação

Na tela `Editor`, alternar para `Exportar`.

Validar:

- existem alvos:
  - Arduino;
  - ESP32;
  - ESPHome;
- aparece validação de GPIO;
- pinos perigosos/reservados geram alerta visual;
- code preview usa fundo `#020817` ou `#0B1220`;
- texto do código é claro (`#F8FAFC` ou próximo);
- botões Copiar código e Exportar código aparecem com boa área de toque.

## 10. Tela Ref / Tags + Diagnóstico

Abrir: `Ref`.

Validar:

- a aba Ref não fica vazia;
- ReferenceHubPanel ainda aparece;
- PremiumTagsDiagnosticsScreen aparece;
- tabela de tags tem:
  - Tag;
  - Tipo;
  - Escopo;
  - Valor;
  - Descrição;
  - Forçado;
- há Force didático:
  - Normal;
  - Force ON;
  - Force OFF;
- há alerta de segurança sobre Force;
- há diagnóstico de scan, linha ativa, saída ativa e eventos recentes.

## 11. Critério final de aceite

O pacote visual premium pode ser considerado aprovado quando:

1. `npm run typecheck` passa.
2. `npm run test:simulator` passa.
3. `npm run test:quality` passa.
4. As seis abas principais abrem sem tela vazia.
5. Nenhuma tela premium tem fundo branco inesperado.
6. Código/exportação tem contraste correto.
7. Simulação mobile mantém saída/carga sempre visível.
8. A experiência no celular se aproxima dos mockups salvos.

## 12. Próxima fase após aprovação

Depois que este checklist passar:

1. Integrar os dados reais do simulador nas telas premium.
2. Substituir renderizações emergenciais no BottomNavigation por renderização principal no App.tsx.
3. Refinar microinterações, animações leves e estados vazios.
4. Expandir lições históricas e técnicas do CLP.
5. Preparar versão de teste interno para Play Store.
