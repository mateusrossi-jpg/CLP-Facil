# MVP — Easy-CLP

## Objetivo

Criar uma primeira versão Android educativa, visual e funcional para ensinar lógica CLP/Ladder por meio de lições prontas e simulações interativas.

O MVP deve priorizar clareza, estabilidade e valor didático, não um editor Ladder completo.

## Princípio central

A primeira versão deve funcionar como um professor interativo:

- apresenta uma lição;
- mostra o circuito Ladder;
- permite acionar entradas virtuais;
- simula estados de saída;
- explica o que aconteceu;
- reforça conceitos técnicos.

## Funcionalidades obrigatórias

### 1. Tela inicial

- Nome do app: Easy-CLP.
- Subtítulo: Simulador Ladder Educativo.
- Cards de módulos:
  - Fundamentos;
  - Motores;
  - Temporizadores;
  - Contadores;
  - Desafios, bloqueado para versão futura.
- Card de progresso simples: lições concluídas.

### 2. Módulo Fundamentos

Lições iniciais:

1. Contato normalmente aberto.
2. Contato normalmente fechado.
3. Bobina de saída.
4. Lógica AND.
5. Lógica OR.
6. Selo/retenção.
7. Intertravamento lógico.

### 3. Módulo Motores

Lições iniciais:

1. Partida direta simples.
2. Partida direta com selo.
3. Partida com botão desliga.
4. Partida com emergência.
5. Partida com sobrecarga.
6. Reversão com intertravamento.
7. Estrela-triângulo, apenas como lição visual no MVP avançado.

### 4. Simulador visual da lição

Cada lição deve exibir:

- título;
- descrição curta;
- diagrama Ladder didático;
- entradas virtuais;
- saídas virtuais;
- estado do motor/contator/lâmpada;
- explicação dinâmica.

### 5. Simulação mínima obrigatória

A primeira simulação funcional deve ser:

**Partida direta com selo**

Entradas:

- I0: botão Liga, NA momentâneo;
- I1: botão Desliga, NF;
- I2: emergência, NF;
- I3: sobrecarga, NF.

Saídas/memórias:

- Q0: contator K1;
- Motor: ligado quando K1 estiver energizado.

Regra lógica:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
```

Comportamento esperado:

- tocar em Liga aciona Q0;
- soltar Liga mantém Q0 pelo selo;
- tocar em Desliga desliga Q0;
- acionar Emergência desliga Q0;
- acionar Sobrecarga desliga Q0;
- o app deve explicar cada mudança.

## Fora do escopo do MVP

Não implementar ainda:

- editor Ladder livre;
- exportação PDF;
- login;
- nuvem;
- integração com CLP real;
- comunicação Modbus;
- geração de código para automação real;
- marketplace;
- modo professor/aluno completo.

## Critérios de aceite

O MVP é considerado pronto quando:

- o app abre sem erros no Android;
- a tela inicial apresenta os módulos;
- pelo menos uma lição de Fundamentos funciona;
- a lição de Partida direta com selo funciona;
- as entradas virtuais alteram o estado da saída corretamente;
- há explicação didática visível;
- o visual está coerente com tema escuro profissional;
- não há promessas de uso industrial real.
