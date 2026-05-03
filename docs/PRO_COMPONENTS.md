# Componentes Pro — CLP Fácil

## Decisão de produto

O CLP Fácil deve ser um simulador educativo com uma base gratuita realmente útil e uma versão Pro que libera componentes avançados.

A versão gratuita precisa permitir ao usuário entender o valor do app, montar comandos básicos e simular lógicas simples. A versão Pro deve liberar recursos mais completos, especialmente para quem estuda, ensina ou trabalha com automação.

## Modelo recomendado

### Gratuito

Componentes essenciais:

- Botão NA.
- Botão NF.
- Chave liga/desliga.
- Emergência NF.
- Sensor NA.
- Sensor NF.
- Contato NA.
- Contato NF.
- Bobina simples.
- Bobina de memória M.
- Lâmpada piloto.
- Contator.
- Motor simples.

Recursos gratuitos:

- Lições básicas.
- Simulador com projetos simples.
- Partida direta com selo.
- Intertravamento básico.
- Salvar poucos projetos locais.
- Anúncios discretos.

### Pro

Componentes avançados:

- TON, temporizador na energização.
- TOF, temporizador no desligamento.
- TP, temporizador de pulso.
- CTU, contador crescente.
- CTD, contador decrescente.
- Reset de contador.
- Comparadores lógicos.
- Motor reversível.
- Estrela-triângulo didático.
- Bomba alternada.
- Sequenciador de motores.
- Sinaleiro industrial completo.
- Sensor analógico didático, futuro.

Recursos Pro:

- Remover anúncios.
- Projetos salvos ilimitados.
- Exportação futura em imagem/PDF.
- Lições avançadas.
- Desafios avançados.
- Biblioteca completa de componentes.
- Exemplos prontos de comandos industriais.

## Compra recomendada

Começar com compra vitalícia simples, não assinatura.

Motivos:

- Melhor aceitação para estudantes.
- Menor barreira de entrada.
- Simples de explicar.
- Bom para app educacional.

Assinatura pode ser avaliada apenas no futuro se houver modo professor, relatórios, nuvem ou biblioteca online.

## Componentes que justificam o Pro

### TON

O TON é um dos componentes mais importantes para CLP. Ele permite ligar uma saída apenas depois que a entrada permanecer ativa por um tempo.

Exemplo:

```text
Se I0 ficar ligado por 5 segundos, Q0 liga.
```

### TOF

O TOF mantém a saída ligada por um tempo após a entrada desligar.

Exemplo:

```text
Quando I0 desliga, Q0 permanece ligado por 5 segundos.
```

### TP

O TP gera um pulso por tempo definido.

Exemplo:

```text
Ao receber um comando, Q0 liga por 1 segundo e depois desliga.
```

### CTU

O CTU conta pulsos crescentes até atingir um valor programado.

Exemplo:

```text
Após contar 10 peças, Q0 liga.
```

### CTD

O CTD conta para baixo a partir de um valor definido.

## Estratégia de liberação

Ordem sugerida:

1. Gratuito: contatos, bobinas, motor simples, lâmpada, contator.
2. Pro inicial: TON e TOF.
3. Pro intermediário: CTU, reset e TP.
4. Pro avançado: motor reversível, estrela-triângulo e sequenciador.
5. Pro educacional: desafios e relatórios.

## Regra de experiência

Nunca bloquear tudo. O usuário gratuito deve conseguir montar circuitos úteis.

A versão Pro deve parecer uma expansão natural, não uma punição.

## Comunicação no app

Mensagens recomendadas:

- "Disponível no Pro".
- "Componente avançado".
- "Use TON, TOF e contadores na versão Pro".
- "O simulador básico continua gratuito".

Evitar mensagens agressivas ou excesso de bloqueios.
