# Modo Simulador — Easy-CLP

## Decisão de produto

O Easy-CLP não deve ser apenas um app de lições guiadas. Ele deve ter dois modos principais:

1. **Modo Aprender** — lições guiadas, explicações e simulações prontas.
2. **Modo Simulador** — ambiente livre para montar e testar comandos elétricos e lógicas Ladder.

O objetivo é unir aprendizado com prática. O usuário aprende o conceito em uma lição e depois pode montar sua própria lógica no simulador.

## Referência conceitual

O modo simulador deve se inspirar no valor de ferramentas de montagem e simulação de comandos, mas sem copiar interface, marca, código, ícones ou fluxo de outro aplicativo.

A identidade do Easy-CLP deve ser própria:

- português brasileiro;
- visual técnico escuro;
- foco em educação;
- explicações integradas;
- preparação para lógica CLP/Ladder;
- experiência pensada para Android.

## Objetivo do simulador no MVP

O simulador livre do MVP deve começar simples. Ele não precisa ser um editor profissional completo na primeira versão.

A primeira meta é permitir montar pequenos circuitos/lógicas com componentes básicos e executar a simulação.

## Componentes mínimos do simulador livre

### Entradas

- Botão NA momentâneo.
- Botão NF momentâneo.
- Chave seletora liga/desliga.
- Emergência NF.
- Sensor NA.
- Sensor NF.

### Saídas

- Bobina Q.
- Lâmpada piloto.
- Contator K.
- Motor.

### Elementos lógicos

- Contato NA associado a uma entrada, saída ou memória.
- Contato NF associado a uma entrada, saída ou memória.
- Bobina simples.
- Bobina de memória M.

### Temporizadores futuros

- TON.
- TOF.
- Pulso.

### Contadores futuros

- CTU.
- Reset.

## Modelo de edição inicial

Para celular, evitar começar com desenho totalmente livre por linhas arrastáveis, porque isso aumenta muito a complexidade.

A primeira versão do simulador pode usar um **editor por blocos/rungs**:

- usuário cria uma linha lógica;
- escolhe contatos em série;
- adiciona ramo paralelo quando necessário;
- escolhe a bobina de saída;
- o app desenha o Ladder de forma automática;
- o usuário simula entradas e observa saídas.

## Exemplo de montagem no simulador

### Linha 1 — Partida com selo

Contatos em série:

- I1 Desliga NF.
- I2 Emergência NF.
- I3 Sobrecarga NF.

Ramo paralelo de acionamento:

- I0 Liga NA.
- Q0 Selo NA.

Bobina:

- Q0 Contator K1.

Regra resultante:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
```

## Estrutura de dados sugerida

```text
Project
  id
  name
  rungs[]
  variables
  createdAt
  updatedAt

Rung
  id
  label
  expression
  coil

Contact
  id
  variable
  type: NA | NF

Coil
  id
  variable
  type: output | memory
```

## Motor de simulação

A simulação deve ser determinística e didática.

Ciclo básico:

1. Ler entradas virtuais.
2. Avaliar cada rung em ordem.
3. Atualizar memórias e saídas.
4. Atualizar visual do Ladder.
5. Atualizar indicadores de motor, lâmpadas e contatores.
6. Exibir explicação curta do estado atual.

## Interface do modo simulador

Tela sugerida:

```text
Topo:
  Nome do projeto
  Botão Simular / Editar
  Botão Salvar

Área central:
  Ladder gerado automaticamente

Painel inferior:
  Entradas virtuais
  Saídas e estados
  Biblioteca de componentes
```

## Modos de funcionamento

### Modo edição

- adicionar linha;
- adicionar contato;
- adicionar ramo paralelo;
- escolher bobina;
- renomear variável;
- excluir elemento.

### Modo simulação

- travar edição;
- permitir acionar entradas;
- animar energia lógica;
- mostrar estado de contatos e bobinas;
- exibir painel de explicação.

## Prioridade visual

O simulador deve ser mais simples que um CAD elétrico e mais didático que um desenho manual.

Prioridades:

- clareza em tela pequena;
- toque fácil;
- blocos grandes;
- zoom ou scroll horizontal quando necessário;
- feedback visual imediato;
- evitar excesso de menus.

## Diferença entre o Easy-CLP e um simulador comum

O Easy-CLP deve ter uma camada educativa permanente:

- explicar por que a saída ligou;
- mostrar qual contato está bloqueando a linha;
- indicar conflito de lógica;
- alertar quando duas saídas conflitantes estão ativas;
- sugerir intertravamento;
- permitir transformar um exemplo pronto em projeto editável.

## Escopo do MVP revisado

O MVP deve conter:

1. Modo Aprender com lições guiadas.
2. Modo Simulador com editor por blocos/rungs simples.
3. Primeiro projeto editável: partida direta com selo.
4. Biblioteca inicial de componentes.
5. Simulação de entradas e saídas.
6. Salvamento local simples de projetos.

## Fora do escopo inicial

Não implementar ainda:

- desenho elétrico totalmente livre;
- fios arrastáveis complexos;
- integração com CLP real;
- Modbus;
- exportação avançada;
- multiusuário;
- nuvem;
- loja de projetos.

## Evolução futura

- Editor visual mais livre.
- Temporizadores funcionais.
- Contadores funcionais.
- Exportação em imagem/PDF.
- Biblioteca de exemplos.
- Compartilhamento de projetos.
- Modo professor/aluno.
