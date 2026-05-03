# Taxonomia de comandos CLP/Ladder — CLP Fácil

Este documento organiza os elementos de CLP/Ladder e comandos elétricos que serão estudados, categorizados e implementados gradualmente no simulador.

## Princípio do app

O CLP Fácil terá duas frentes permanentes:

1. **Educação livre**: ensinar o funcionamento dos elementos, exemplos e lógica.
2. **Simulador Pro**: permitir criar projetos próprios, salvar, editar e usar blocos avançados.

A educação deve ser aberta. O uso avançado do simulador financia o desenvolvimento.

## Linguagens e conceitos de referência

O simulador começa por Ladder/LD, mas deve ser pensado de forma expansível para conceitos usados em CLPs modernos:

- LD: Ladder Diagram.
- FBD: Function Block Diagram.
- ST: Structured Text.
- SFC: Sequential Function Chart.

No app, a prioridade inicial é Ladder, mas alguns blocos podem futuramente ter visual de função/bloco.

## Categorias principais

## 1. Entradas e dispositivos de comando

### Gratuito

- Botão NA.
- Botão NF.
- Chave seletora simples.
- Emergência NF.
- Sensor NA.
- Sensor NF.
- Fim de curso NA.
- Fim de curso NF.

### Pro futuro

- Sensor analógico.
- Chave multi posição.
- Encoder/pulso simulado.
- Sensor de nível.
- Sensor de pressão.
- Sensor de temperatura.

## 2. Contatos Ladder

### Gratuito

- Contato NA.
- Contato NF.
- Contato de saída.
- Contato de memória.
- Contato de permissivo.
- Contato de bloqueio/intertravamento.

### Pro futuro

- Contato por borda de subida.
- Contato por borda de descida.
- Contato temporizado.
- Contato associado a comparador.

## 3. Bobinas e saídas

### Gratuito

- Bobina simples Q.
- Bobina de memória M simples.
- Saída para lâmpada piloto.
- Saída para contator.
- Saída para motor simples.

### Pro

- Bobina SET.
- Bobina RESET.
- Bobina pulso.
- Bobina com retenção configurável.
- Saída com intertravamento configurável.

## 4. Lógica básica

### Gratuito

- AND, contatos em série.
- OR, ramos em paralelo.
- NOT, contato NF.
- Selo/retenção.
- Intertravamento simples.

### Pro futuro

- Agrupamentos lógicos.
- Blocos lógicos visualmente compactos.
- Expressões combinadas.
- Validação de conflito lógico.

## 5. Temporizadores

### Educação livre

Todo usuário pode estudar os temporizadores, ver exemplos e entender como funcionam.

### Simulador Pro

- TON: atraso na energização.
- TOF: atraso no desligamento.
- TP: pulso temporizado.
- Temporizador cíclico.
- Temporizador retentivo.

### Campos de edição

- Nome do temporizador.
- Variável de entrada.
- Tempo preset.
- Tempo acumulado.
- Unidade: ms, s, min.
- Saída done/ativo.

## 6. Contadores

### Educação livre

Todo usuário pode estudar contadores e ver exemplos.

### Simulador Pro

- CTU: contador crescente.
- CTD: contador decrescente.
- CTUD: crescente/decrescente.
- Reset.
- Preset.
- Done bit.

### Campos de edição

- Nome do contador.
- Entrada de pulso.
- Entrada de reset.
- Preset.
- Valor acumulado.
- Saída done.

## 7. SET/RESET e memórias

### Educação livre

- Explicação de latch.
- Diferença entre selo e SET/RESET.
- Risco de manter saída travada sem reset adequado.

### Simulador Pro

- SET.
- RESET.
- Memória retentiva.
- Memória não retentiva.
- Reset geral de simulação.

## 8. Comparadores

### Pro futuro

- Igual a.
- Diferente de.
- Maior que.
- Menor que.
- Maior ou igual.
- Menor ou igual.
- Dentro de faixa.
- Fora de faixa.

### Uso típico

- Comparar contador com preset.
- Comparar entrada analógica com limite.
- Acionar alarme por limite.

## 9. Matemática e conversões

### Pro futuro

- Soma.
- Subtração.
- Multiplicação.
- Divisão.
- Escala analógica.
- Conversão de unidades.
- Mínimo e máximo.
- Média simples.

### Aplicações

- Instrumentação.
- Sinais analógicos.
- Simulação didática de sensores.

## 10. Sequência e SFC simplificado

### Pro futuro

- Etapa.
- Transição.
- Ação.
- Sequência de partida.
- Processo passo a passo.

### Aplicações

- Esteira.
- Máquina simples.
- Ciclo automático.
- Partida sequencial de motores.

## 11. Comandos de motores

### Gratuito

- Partida direta simples.
- Partida direta com selo.
- Emergência cortando comando.
- Sobrecarga cortando motor.

### Pro

- Reversão com intertravamento.
- Partida estrela-triângulo.
- Partida sequencial.
- Duas bombas alternadas.
- Bomba principal/reserva.
- Motor com fim de curso.
- Motor com temporização.
- Motor com falha e rearme.

## 12. Elementos de painel elétrico

### Gratuito

- Botoeira liga.
- Botoeira desliga.
- Lâmpada piloto.
- Contator.
- Motor.

### Pro futuro

- Sinaleiro verde/vermelho/âmbar.
- Buzzer.
- Relé térmico.
- Relé auxiliar.
- Disjuntor motor visual.
- Seletora manual/automático.
- Botão reset de falha.

## 13. Diagnóstico e debug didático

### Gratuito

- Mostrar estado das entradas.
- Mostrar estado das saídas.
- Mostrar linha energizada.
- Explicar por que um motor ligou/desligou.

### Pro futuro

- Debug passo a passo.
- Destaque do contato que bloqueia a linha.
- Lista de conflitos.
- Aviso de bobina duplicada.
- Aviso de saída sem reset.
- Simulação ciclo a ciclo.

## 14. Comunicação e integração

### Futuro avançado

- Conceitos de Modbus, apenas educativo inicialmente.
- Mapeamento de entradas/saídas.
- Tabela de tags.
- Importação/exportação de projeto.

Não implementar integração com CLP físico no MVP.

## 15. Segurança e limites

O app é educativo e de simulação. Ele não deve ser apresentado como ferramenta de validação industrial real.

Evitar prometer:

- segurança de máquina real;
- conformidade normativa automática;
- substituição de CLP real;
- comissionamento real.

## Ordem recomendada de implementação

### Etapa 1 — Base livre

- Contato NA.
- Contato NF.
- Bobina simples.
- Selo.
- Intertravamento simples.
- Motor simples.
- Lâmpada piloto.
- Projetos de exemplo.

### Etapa 2 — Editor visual básico

- Selecionar rung.
- Adicionar componente.
- Remover componente.
- Tocar componente para editar.
- Inserir ramo paralelo.
- Alternar editar/simular.

### Etapa 3 — Pro inicial

- Criar projeto próprio.
- Salvar projeto.
- SET.
- RESET.
- TON.
- TOF.
- CTU.

### Etapa 4 — Motor avançado

- Reversão.
- Estrela-triângulo.
- Partida sequencial.
- Bomba alternada.

### Etapa 5 — Debug e exportação

- Debug passo a passo.
- Avisos de erro.
- Exportar imagem.
- Exportar PDF.

## Observação de produto

A parte educacional deve explicar até mesmo componentes Pro. O bloqueio Pro deve aparecer apenas quando o usuário quiser usar o componente avançado em projeto próprio, salvar projetos complexos ou exportar resultados.
