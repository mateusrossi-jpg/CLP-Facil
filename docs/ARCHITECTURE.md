# Arquitetura — Easy-CLP

## Direção técnica recomendada

O app deve ser construído como um aplicativo Android-first, com arquitetura simples, modular e fácil de evoluir.

A tecnologia recomendada para início é **React Native com Expo**, por facilitar desenvolvimento, testes rápidos, publicação Android e futura compatibilidade iOS.

## Objetivos arquiteturais

- Manter o app leve.
- Separar conteúdo educativo da lógica de simulação.
- Permitir adicionar novas lições sem reescrever telas.
- Evitar dependência de internet no MVP.
- Preparar monetização futura sem travar o desenvolvimento atual.
- Criar um motor lógico didático que possa evoluir para editor Ladder no futuro.

## Estrutura sugerida

```text
src/
  app/
    AppNavigator.tsx
  screens/
    HomeScreen.tsx
    ModuleScreen.tsx
    LessonScreen.tsx
    SimulatorScreen.tsx
  components/
    AppCard.tsx
    AppHeader.tsx
    LadderDiagram.tsx
    LadderRung.tsx
    LadderContact.tsx
    LadderCoil.tsx
    InputButton.tsx
    OutputIndicator.tsx
    MotorIndicator.tsx
    ExplanationPanel.tsx
  data/
    lessons.ts
    modules.ts
  engine/
    plcTypes.ts
    plcSimulator.ts
    motorLessons.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
  utils/
    format.ts
```

## Modelo conceitual

### Lesson

Uma lição deve conter:

- id;
- moduleId;
- title;
- shortDescription;
- theory;
- ladderModel;
- initialState;
- simulationType;
- explanationRules;
- difficulty;
- isPro;

### PLC State

Estado mínimo:

```text
inputs: I0, I1, I2, I3...
outputs: Q0, Q1...
memories: M0, M1...
timers: T0, T1...
counters: C0, C1...
```

### Engine inicial

No MVP, a engine pode começar simples e explícita, com funções por tipo de lição.

Exemplo:

```text
simulateDirectStartWithSeal(state): nextState
```

Depois, ela pode evoluir para um interpretador genérico de Ladder.

## Motor Ladder futuro

No futuro, o motor deve representar cada linha Ladder como uma árvore lógica:

```text
Rung
  contacts[]
  branches[]
  coil
```

Cada contato avalia uma variável de estado:

- NA: true quando variável está ativa;
- NF: true quando variável está inativa;
- Coil: recebe o resultado lógico da linha.

## UI e simulação

O diagrama Ladder no MVP não precisa ser um editor livre. Ele pode ser uma visualização controlada por dados.

Cada lição informa quais contatos e bobinas serão desenhados. O usuário toca nas entradas virtuais, não no diagrama.

## Persistência

No MVP:

- usar armazenamento local simples para progresso de lições;
- não usar login;
- não usar backend;
- não usar nuvem.

## Monetização futura

Preparar pontos de extensão para:

- anúncios leves;
- compra Pro;
- lições bloqueadas;
- exportação premium;
- desafios premium.

Mas não bloquear o MVP pela monetização.

## Segurança e responsabilidade

O app é educativo. Toda tela com simulações de motores deve conter linguagem clara de que o conteúdo é para aprendizado e não substitui projetos, normas, análise de risco ou comissionamento industrial real.
