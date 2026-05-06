# CLP Fácil — plano de refatoração da bancada mobile

## Objetivo desta etapa

Antes de continuar adicionando novas melhorias visuais, organizar o fluxo do app para que o CLP Fácil fique mais profissional, sustentável e fácil de evoluir.

A direção de produto permanece:

- Duolingo de CLP.
- PLC Simulator mobile/desktop.
- Bancada Ladder com I/O e scan no mesmo local.
- Editor contextual por clique/toque no bloco.
- Modo Guiado para missões.
- Modo Livre para quem já sabe programar.
- Workbench completo preservado como modo avançado/desktop.

## Estado atual que deve ser preservado

A branch `mobile-experience-integration` já contém avanços importantes:

- `SmartphoneSimulationPanel` roteia a experiência mobile para `MobilePlcExperience`.
- `MobilePlcExperience` organiza Guiado/Livre e chama `MobilePlcWorkspace`.
- `MobilePlcWorkspace` concentra a bancada mobile: I/O, rung, edição, simulação e missão.
- `MobileIoDock` virou painel I/O mais parecido com simulador PLC.
- `MobileSimulationControls` mostra SCAN, AUTO, EDITAR/TESTAR e ciclo `Ler I → Resolver Ladder → Atualizar Q`.
- `MobileBlockQuickEditor` virou inspetor/editor contextual do bloco selecionado.
- Diagnósticos avançados ficam recolhidos em detalhes avançados.

## Problema atual

As melhorias foram feitas incrementalmente e agora o código precisa ser organizado para evitar:

- wrappers acumulando responsabilidades demais;
- duplicação entre smartphone panel, enhanced panel, workspace e quick editor;
- callbacks muito longos passando por muitas camadas;
- componentes grandes difíceis de manter;
- mistura entre fluxo principal, detalhes avançados e recursos legados;
- risco de quebrar o app ao evoluir drag-and-drop, animações e missões.

## Arquitetura alvo

```text
App.tsx
└─ modo simulate
   ├─ smartphone/mobile
   │  └─ MobileWorkbenchScreen
   │     ├─ MobileWorkbenchHeader
   │     ├─ MobileWorkspaceModePanel
   │     ├─ MobilePlcWorkspace
   │     │  ├─ MobileIoDock
   │     │  ├─ MobileRungViewer
   │     │  ├─ MobileSimulationControls
   │     │  └─ MobileToolbox / edição rápida
   │     ├─ MobileBlockQuickEditor
   │     └─ MobileAdvancedDetails
   └─ desktop/tablet/avançado
      └─ PlcWorkbench
```

## Ordem de refatoração recomendada

### 1. Criar um wrapper sem lógica pesada

Criar `src/components/mobileWorkbench/MobileWorkbenchScreen.tsx`.

Responsabilidade:

- receber props vindas do fluxo real;
- renderizar header, experiência principal, editor rápido e detalhes avançados;
- não conter regra de ladder;
- não duplicar lógica do workspace.

### 2. Extrair header da bancada

Criar `MobileWorkbenchHeader.tsx`.

Responsabilidade:

- mostrar `PLC Simulator`;
- mostrar `Programa Ladder + I/O + Scan`;
- mostrar `I/O → Ladder → Q`;
- mostrar status `EDITOR`, `SCAN` ou `AUTO`.

### 3. Extrair detalhes avançados

Criar `MobileAdvancedDetails.tsx`.

Responsabilidade:

- botão de abrir/fechar detalhes;
- renderizar `SmartphoneSimulationPanelEnhanced` em modo `embeddedDiagnosticsOnly`;
- manter CPU, memória, relatório, force e diagnósticos fora da bancada principal.

### 4. Simplificar `SmartphoneSimulationPanel.tsx`

Depois dos componentes extraídos, ele deve virar apenas compatibilidade:

```tsx
export const SmartphoneSimulationPanel = memo((props) => (
  <MobileWorkbenchScreen {...props} />
));
```

### 5. Preservar `PlcWorkbench`

Não apagar.

Ele deve continuar como:

- desktop;
- tablet amplo;
- editor completo;
- modo avançado;
- base para uso professor/técnico.

### 6. Consolidar callbacks

Depois que o wrapper estiver limpo, considerar criar um tipo compartilhado:

```ts
MobileWorkbenchCallbacks
```

Para evitar passar dezenas de props manualmente em vários arquivos.

### 7. Depois da refatoração, voltar às melhorias visuais

Retomar a sequência já planejada:

1. glow energético nos fios;
2. contatos conduzindo visualmente;
3. bloco selecionado pulsando;
4. popup contextual preso ao bloco;
5. ladder mais full-screen;
6. drag-and-drop direto na rung;
7. reduzir aparência de cards;
8. scan contínuo animado;
9. modo missão/trilha estilo Duolingo;
10. modo professor no futuro.

## Critérios de aceitação da refatoração

- Build não deve quebrar.
- `PlcWorkbench` continua existindo.
- Fluxo smartphone continua usando `MobilePlcExperience`.
- Editor contextual continua visível no smartphone.
- Detalhes avançados continuam recolhidos.
- Modo Guiado/Livre continua funcionando.
- I/O, Ladder e Scan continuam no mesmo local.
- Nenhuma funcionalidade existente deve ser removida.

## Observação importante

Esta documentação guarda o passo a passo anterior para ser retomado depois da organização. A prioridade imediata agora é limpar arquitetura e fluxo antes de adicionar mais efeitos visuais.
