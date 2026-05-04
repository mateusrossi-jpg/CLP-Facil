# Prompt para Codex — Modo Simulador do Easy-CLP

Use este prompt depois do bootstrap inicial do app ou junto com ele, se o projeto ainda estiver pequeno.

---

Você está trabalhando no projeto **Easy-CLP**, um aplicativo Android educativo para aprendizado e simulação de lógica CLP/Ladder.

O produto deve ter dois modos principais:

1. **Aprender** — lições guiadas com explicações.
2. **Simular** — ambiente livre para montar e testar comandos/lógicas.

Leia primeiro:

- `README.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/LESSONS_CATALOG.md`
- `docs/SIMULATOR_MODE.md`

## Objetivo desta tarefa

Implementar o primeiro esqueleto do **Modo Simulador**, sem tentar criar um CAD completo na primeira versão.

A prioridade é ter um simulador funcional por blocos/rungs, adequado para celular.

## O que criar

Criar ou ajustar estas telas/componentes:

```text
src/screens/SimulatorHomeScreen.tsx
src/screens/ProjectEditorScreen.tsx
src/screens/SimulationRunScreen.tsx
src/components/ComponentLibrary.tsx
src/components/RungEditor.tsx
src/components/VariablePicker.tsx
src/components/SimulationPanel.tsx
src/components/ProjectCard.tsx
src/engine/projectTypes.ts
src/engine/ladderEvaluator.ts
src/data/defaultProjects.ts
```

## Conceito do simulador

O usuário deve conseguir:

- abrir o modo Simular;
- criar um projeto simples;
- escolher um exemplo pronto;
- visualizar uma lógica Ladder;
- acionar entradas virtuais;
- ver saídas e motor mudarem;
- alternar entre edição e simulação.

## Primeiro projeto editável obrigatório

Criar projeto exemplo:

**Partida direta com selo**

Entradas:

- I0: Liga, NA momentâneo.
- I1: Desliga, NF.
- I2: Emergência, NF.
- I3: Sobrecarga, NF.

Saída:

- Q0: Contator K1.

Atuador visual:

- MTR1: Motor.

Regra:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
MTR1 = Q0
```

## Modelo de dados inicial

Use um modelo simples e evolutivo:

```ts
type VariableType = 'input' | 'output' | 'memory' | 'timer' | 'counter';
type ContactType = 'NO' | 'NC';

type LadderContact = {
  id: string;
  variableId: string;
  type: ContactType;
};

type LadderBranch = {
  id: string;
  contacts: LadderContact[];
};

type LadderRung = {
  id: string;
  label: string;
  seriesContacts: LadderContact[];
  parallelBranches: LadderBranch[];
  coilVariableId: string;
};

type LadderProject = {
  id: string;
  name: string;
  variables: PlcVariable[];
  rungs: LadderRung[];
};
```

## Avaliador Ladder mínimo

Implementar avaliação determinística:

- contato NO conduz se a variável estiver true;
- contato NC conduz se a variável estiver false;
- contatos em série usam AND;
- ramos paralelos usam OR;
- bobina recebe o resultado final da linha;
- avaliar rungs em ordem.

Para a partida com selo, garantir que o contato Q0 usado no ramo paralelo consiga manter a saída ligada após soltar I0.

## Interface mínima

A tela do simulador deve ter:

- título do projeto;
- botão Editar/Simular;
- diagrama Ladder visual;
- painel de entradas virtuais;
- painel de saídas;
- indicação do motor ligado/desligado;
- painel explicando por que a saída está ligada ou desligada.

## Biblioteca inicial de componentes

Mostrar biblioteca com:

- Botão NA.
- Botão NF.
- Chave liga/desliga.
- Emergência NF.
- Sensor NA.
- Sensor NF.
- Bobina Q.
- Contator K.
- Motor.
- Lâmpada piloto.

Na primeira versão, a biblioteca pode ser apenas visual/listada, com edição limitada. O importante é já deixar a estrutura pronta para evolução.

## Regras de UX

- Não usar menus complexos.
- Usar botões grandes para toque em celular.
- Usar cores claras para estado ativo/inativo.
- Mostrar alerta didático quando emergência ou sobrecarga estiverem acionadas.
- Evitar termos industriais sem explicação.

## Fora do escopo desta tarefa

Não implementar ainda:

- fios arrastáveis livres;
- zoom avançado;
- exportação PDF;
- temporizadores reais;
- contadores reais;
- integração com CLP físico;
- backend;
- login;
- monetização.

## Critério de aceite

A tarefa estará pronta quando:

- existir entrada clara para o Modo Simular na Home;
- abrir um projeto exemplo;
- alterar entradas mudar o estado da saída;
- o motor ligar/desligar corretamente;
- a lógica de selo funcionar;
- a estrutura de dados permitir adicionar novos projetos no futuro;
- o app compilar sem erros.
