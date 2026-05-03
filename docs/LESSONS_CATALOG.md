# Catálogo de Lições — CLP Fácil

Este documento organiza as lições planejadas para o app. O objetivo é manter o conteúdo didático separado da implementação.

## Nível 1 — Fundamentos

### 1. Contato normalmente aberto

Objetivo:

- Ensinar que o contato NA só conduz quando a entrada está ativa.

Elementos:

- I0: botão/sensor NA.
- Q0: lâmpada piloto.

Regra:

```text
Q0 = I0
```

### 2. Contato normalmente fechado

Objetivo:

- Ensinar que o contato NF conduz quando a entrada está inativa.

Elementos:

- I0: botão/sensor NF.
- Q0: lâmpada piloto.

Regra:

```text
Q0 = NOT I0
```

### 3. Bobina de saída

Objetivo:

- Mostrar que a bobina representa uma saída lógica energizada.

Elementos:

- I0: comando.
- Q0: bobina.

Regra:

```text
Q0 = I0
```

### 4. Lógica AND

Objetivo:

- Mostrar que duas condições em série precisam estar verdadeiras.

Elementos:

- I0: condição 1.
- I1: condição 2.
- Q0: saída.

Regra:

```text
Q0 = I0 AND I1
```

### 5. Lógica OR

Objetivo:

- Mostrar que caminhos em paralelo permitem acionar uma saída por uma condição ou outra.

Elementos:

- I0: botão 1.
- I1: botão 2.
- Q0: saída.

Regra:

```text
Q0 = I0 OR I1
```

### 6. Selo/retenção

Objetivo:

- Ensinar a lógica de auto-retenção usada em comandos de motores.

Elementos:

- I0: Liga.
- I1: Desliga NF.
- Q0: contator.

Regra:

```text
Q0 = (I0 OR Q0) AND I1
```

### 7. Intertravamento lógico

Objetivo:

- Impedir que duas saídas conflitantes sejam acionadas ao mesmo tempo.

Elementos:

- I0: comando avanço.
- I1: comando retorno.
- Q0: avanço.
- Q1: retorno.

Regra:

```text
Q0 = I0 AND NOT Q1
Q1 = I1 AND NOT Q0
```

## Nível 2 — Motores

### 1. Partida direta simples

Objetivo:

- Mostrar acionamento direto de contator por um comando.

Elementos:

- I0: Liga.
- Q0: K1.
- Motor: ligado quando Q0 = true.

Regra:

```text
Q0 = I0
```

### 2. Partida direta com selo

Objetivo:

- Ensinar partida de motor com retenção lógica.

Elementos:

- I0: Liga NA momentâneo.
- I1: Desliga NF.
- I2: Emergência NF.
- I3: Sobrecarga NF.
- Q0: K1.
- Motor: ligado quando Q0 = true.

Regra:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
```

### 3. Partida com emergência

Objetivo:

- Mostrar que emergência deve cortar a retenção do circuito.

Regra:

```text
Q0 = (I0 OR Q0) AND I1 AND I2
```

### 4. Partida com sobrecarga

Objetivo:

- Mostrar proteção lógica contra condição de falha.

Regra:

```text
Q0 = (I0 OR Q0) AND I1 AND I2 AND I3
```

### 5. Reversão de motor com intertravamento

Objetivo:

- Ensinar que avanço e reverso não podem ser acionados simultaneamente.

Elementos:

- I0: Liga avanço.
- I1: Liga reverso.
- I2: Desliga.
- Q0: K1 avanço.
- Q1: K2 reverso.

Regra conceitual:

```text
Q0 = I0 AND I2 AND NOT Q1
Q1 = I1 AND I2 AND NOT Q0
```

## Nível 3 — Temporizadores

### 1. TON — atraso na energização

Objetivo:

- Mostrar que a saída só liga após a entrada permanecer ativa pelo tempo configurado.

### 2. TOF — atraso no desligamento

Objetivo:

- Mostrar que a saída permanece ligada por um tempo após a entrada desligar.

### 3. Partida sequencial de motores

Objetivo:

- Motor 2 liga alguns segundos após Motor 1.

## Nível 4 — Contadores

### 1. Contador crescente

Objetivo:

- Contar pulsos de entrada.

### 2. Reset de contador

Objetivo:

- Reiniciar a contagem.

### 3. Contagem de peças

Objetivo:

- Simular sensor contando peças em uma esteira.

## Nível 5 — Desafios

Ideias futuras:

- Monte uma partida direta.
- Crie um selo com botão Liga e Desliga.
- Impeça dois motores de ligarem juntos.
- Ligue uma saída após 5 segundos.
- Conte 10 peças e acione uma lâmpada.
