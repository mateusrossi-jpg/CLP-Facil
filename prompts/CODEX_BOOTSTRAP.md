# Prompt para Codex — Bootstrap do Easy-CLP

Use este prompt no Codex dentro do repositório `CLP-Facil`.

---

Você está trabalhando no projeto **Easy-CLP**, um aplicativo Android educativo para aprendizado e simulação de lógica CLP/Ladder.

Leia primeiro estes documentos do repositório:

- `README.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/LESSONS_CATALOG.md`
- `docs/ROADMAP.md`
- `docs/MONETIZATION.md`
- `docs/PLAY_STORE_CHECKLIST.md`

## Objetivo desta tarefa

Inicializar o projeto como um app **React Native com Expo e TypeScript**, Android-first, com tema escuro profissional e uma primeira simulação educativa funcional.

## Requisitos técnicos

- Usar Expo com TypeScript.
- Criar estrutura limpa dentro de `src/`.
- Evitar backend, login, nuvem ou dependências desnecessárias no MVP.
- O app deve rodar localmente com `npm install` e `npx expo start`.
- Priorizar Android, mas sem bloquear futura compatibilidade iOS.

## Estrutura desejada

Crie ou organize a estrutura:

```text
src/
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
    modules.ts
    lessons.ts
  engine/
    plcTypes.ts
    plcSimulator.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
```

## Primeira experiência do app

A tela inicial deve exibir:

- título: Easy-CLP;
- subtítulo: Simulador Ladder Educativo;
- cards dos módulos:
  - Fundamentos;
  - Motores;
  - Temporizadores;
  - Contadores;
  - Desafios;
- indicação de que algumas áreas são futuras.

## Primeira simulação obrigatória

Implementar a lição:

**Partida direta com selo**

Entradas:

- I0: Liga, NA momentâneo;
- I1: Desliga, NF;
- I2: Emergência, NF;
- I3: Sobrecarga, NF.

Saída:

- Q0: Contator K1.

Motor:

- Ligado quando Q0 estiver ativo.

Regra lógica:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
```

Comportamento:

- ao pressionar Liga, Q0 liga;
- ao soltar Liga, Q0 permanece ligado pelo selo;
- ao pressionar Desliga, Q0 desliga;
- ao acionar Emergência, Q0 desliga;
- ao acionar Sobrecarga, Q0 desliga;
- a interface deve mostrar estado de entradas, saída, contator e motor.

## Visual

Criar visual com:

- fundo escuro;
- cards escuros;
- azul/ciano para elementos ativos;
- verde para funcionamento correto;
- âmbar para alerta;
- vermelho para emergência/falha;
- bordas arredondadas;
- boa leitura em tela de celular.

## Conteúdo educativo

A tela da simulação deve explicar:

- o que é botão Liga;
- o que é botão Desliga NF;
- o que é selo;
- por que emergência e sobrecarga cortam o comando;
- que o app é educativo e não substitui projeto industrial real.

## Entrega esperada

Ao final:

- o app deve compilar;
- a primeira tela deve abrir;
- deve ser possível acessar a lição de partida direta com selo;
- a simulação deve funcionar;
- o código deve estar organizado e comentado apenas onde necessário;
- atualizar o README com instruções de instalação e execução, se necessário.

Não implemente monetização, login, backend ou editor Ladder livre nesta etapa.
