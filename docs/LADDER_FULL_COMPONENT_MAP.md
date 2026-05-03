# Mapa completo de componentes Ladder — CLP Fácil

Este documento organiza os componentes que o CLP Fácil deve conhecer, ensinar e implementar gradualmente no simulador.

## Modelo de produto

- **Educação:** livre/gratuita.
- **Exemplos prontos:** livres/gratuitos.
- **Simulador de projetos próprios:** Pro.
- **Componentes avançados em projetos próprios:** Pro.

A ideia é que todo usuário possa aprender, mas o uso do simulador como ferramenta completa ajude a custear o desenvolvimento.

## 1. Dispositivos de entrada físicos/virtuais

Esses são os elementos que o usuário manipula no painel de simulação.

### 1.1 Botões de pulso

Botões de pulso são momentâneos: voltam ao estado inicial quando o usuário solta.

| Componente | Tipo lógico | Uso comum | Free/Pro |
|---|---|---|---|
| Botão Liga NA | Pulso NA | Acionar selo, partida, comando manual | Free |
| Botão Desliga NF | Pulso NF | Parada de comando | Free |
| Botão Reset NA | Pulso NA | Reset de falha, reset de contador | Free/Pro conforme uso |
| Botão Emergência NF | Pulso/travado NF | Cortar comando em simulação didática | Free |
| Botão Jog NA | Pulso NA | Acionamento manual sem selo | Pro futuro |
| Botão Teste NA | Pulso NA | Testar sinalizador, sirene, saída | Free |

### 1.2 Botões fixos / retentivos

Botões fixos mantêm estado até novo toque.

| Componente | Tipo lógico | Uso comum | Free/Pro |
|---|---|---|---|
| Chave liga/desliga | Retentivo | Manter entrada ativa | Free |
| Chave seletora 2 posições | Retentivo | Manual/Automático, Liga/Desliga | Free |
| Chave seletora 3 posições | Retentivo | Manual/0/Automático | Pro |
| Botão trava/destrava | Retentivo | Simular latch físico | Pro futuro |
| Emergência travada | Retentivo NF | Simular cogumelo com rearme | Free |

### 1.3 Sensores digitais

| Componente | Tipo lógico | Uso comum | Free/Pro |
|---|---|---|---|
| Sensor NA | Digital NA | Presença, peça, posição | Free |
| Sensor NF | Digital NF | Falha, proteção, permissivo | Free |
| Fim de curso NA | Digital NA | Avanço/retorno, posição final | Free |
| Fim de curso NF | Digital NF | Intertravamento, segurança lógica | Free |
| Sensor de nível baixo | Digital | Bombas e reservatórios | Pro |
| Sensor de nível alto | Digital | Bombas e reservatórios | Pro |
| Sensor de pressão | Digital | Compressor, bomba, alarme | Pro |
| Sensor de temperatura digital | Digital | Alarme térmico simples | Pro |

### 1.4 Entradas analógicas futuras

| Componente | Uso comum | Free/Pro |
|---|---|---|
| Potenciômetro simulado | Valor analógico 0-100% | Pro futuro |
| Sensor 0-10 V | Instrumentação didática | Pro futuro |
| Sensor 4-20 mA | Instrumentação didática | Pro futuro |
| Temperatura analógica | Controle e alarme por limite | Pro futuro |
| Pressão analógica | Comparadores e alarmes | Pro futuro |

## 2. Contatos Ladder

Contatos são condições lógicas dentro da linha Ladder.

### 2.1 Contatos básicos

| Componente | Função | Free/Pro |
|---|---|---|
| Contato NA | Conduz quando variável = true | Free |
| Contato NF | Conduz quando variável = false | Free |
| Contato de entrada I | Representa botão/sensor | Free |
| Contato de saída Q | Usado como selo/intertravamento | Free |
| Contato de memória M | Condição interna | Free |

### 2.2 Contatos especiais

| Componente | Função | Free/Pro |
|---|---|---|
| Borda de subida | Pulso ao ir de 0 para 1 | Pro |
| Borda de descida | Pulso ao ir de 1 para 0 | Pro |
| Contato temporizado | Depende de temporizador | Pro |
| Contato de contador done | Fecha ao atingir preset | Pro |
| Contato de comparador | Depende de comparação | Pro |
| Contato de falha | Simula falha ativa | Pro futuro |

## 3. Bobinas e saídas Ladder

### 3.1 Bobinas básicas

| Componente | Função | Free/Pro |
|---|---|---|
| Bobina Q | Saída comum não retentiva | Free |
| Bobina M | Memória interna não retentiva | Free |
| Bobina lâmpada | Saída visual didática | Free |
| Bobina contator | Aciona motor/carga no simulador | Free |

### 3.2 Bobinas retentivas e especiais

| Componente | Função | Free/Pro |
|---|---|---|
| SET | Trava variável em true | Pro |
| RESET | Reseta variável para false | Pro |
| Bobina pulso | Saída ativa por um ciclo | Pro |
| Bobina toggle | Alterna estado a cada pulso | Pro futuro |
| Reset geral | Limpa memórias/contadores | Pro futuro |

## 4. Estrutura da linha Ladder

| Elemento | Função | Free/Pro |
|---|---|---|
| Rung / linha | Linha lógica do Ladder | Free para exemplos; Pro para projetos próprios |
| Contatos em série | AND lógico | Free |
| Ramos paralelos | OR lógico | Free |
| Sub-ramo paralelo | OR aninhado | Pro futuro |
| Inserir componente | Adiciona bloco na linha | Pro em projetos próprios |
| Remover componente | Remove bloco da linha | Pro em projetos próprios |
| Reordenar componente | Muda posição do bloco | Pro em projetos próprios |
| Comentário da linha | Anotação didática/técnica | Pro futuro |

## 5. Temporizadores

No modo educacional, todos podem ser explicados livremente. No simulador de projetos próprios, temporizadores são Pro.

| Temporizador | Função | Propriedades editáveis |
|---|---|---|
| TON | Atraso na energização | IN, PT, ET, Q |
| TOF | Atraso no desligamento | IN, PT, ET, Q |
| TP | Pulso temporizado | IN, PT, ET, Q |
| Retentivo | Mantém tempo acumulado | IN, RESET, PT, ET, Q |
| Cíclico | Liga/desliga em ciclos | tempo ligado, tempo desligado |

Campos de edição:

- nome;
- variável associada;
- tempo preset;
- unidade: ms, s, min;
- tempo acumulado;
- saída done/ativo;
- reset, quando aplicável.

## 6. Contadores

No modo educacional, todos podem ser explicados. No simulador de projetos próprios, contadores são Pro.

| Contador | Função | Propriedades editáveis |
|---|---|---|
| CTU | Conta crescente | CU, RESET, PV, CV, Q |
| CTD | Conta decrescente | CD, LOAD, PV, CV, Q |
| CTUD | Conta crescente/decrescente | CU, CD, RESET, LOAD, PV, CV |
| Reset de contador | Zera contagem | variável alvo |
| Preset comparado | Ativa saída ao atingir valor | preset, saída done |

## 7. Comparadores

| Componente | Função | Free/Pro |
|---|---|---|
| Igual | A = B | Pro |
| Diferente | A != B | Pro |
| Maior que | A > B | Pro |
| Menor que | A < B | Pro |
| Maior ou igual | A >= B | Pro |
| Menor ou igual | A <= B | Pro |
| Dentro da faixa | min <= A <= max | Pro futuro |
| Fora da faixa | A < min ou A > max | Pro futuro |

## 8. Operações matemáticas e analógicas futuras

| Bloco | Função | Pro/Free |
|---|---|---|
| ADD | Soma | Pro futuro |
| SUB | Subtração | Pro futuro |
| MUL | Multiplicação | Pro futuro |
| DIV | Divisão | Pro futuro |
| SCALE | Escala sinal analógico | Pro futuro |
| LIMIT | Limita valor mínimo/máximo | Pro futuro |
| AVERAGE | Média simples | Pro futuro |

## 9. Motores e comandos elétricos

### 9.1 Gratuitos / exemplos livres

| Comando | Elementos | Uso |
|---|---|---|
| Partida direta simples | Liga + contator + motor | Fundamento |
| Partida direta com selo | Liga, Desliga, selo, K1 | Comando clássico |
| Emergência cortando comando | Emergência NF em série | Proteção didática |
| Sobrecarga cortando motor | Relé térmico NF em série | Proteção didática |
| Motor com lâmpada piloto | Q0 + sinalizador | Estado visual |

### 9.2 Pro em projetos próprios

| Comando | Elementos | Uso |
|---|---|---|
| Reversão de motor | K1 avanço, K2 reverso, intertravamento | Motor reversível |
| Estrela-triângulo | K principal, K estrela, K triângulo, TON | Partida reduzida |
| Partida sequencial | Motor 1, TON, Motor 2 | Sequência |
| Bomba principal/reserva | alternância, falha, reserva | Automação predial |
| Bomba alternada | alterna por ciclo/partida | Reservatório |
| Motor com fim de curso | avanço/retorno | Máquina simples |
| Motor com falha e rearme | falha, reset, sinalização | Diagnóstico |

## 10. Elementos de painel e sinalização

| Elemento | Função | Free/Pro |
|---|---|---|
| Lâmpada verde | indicação de ligado | Free |
| Lâmpada vermelha | indicação de parado/falha | Free |
| Lâmpada âmbar | alerta | Free/Pro |
| Buzzer | alarme sonoro visual | Pro futuro |
| Sinaleiro torre | verde/âmbar/vermelho | Pro futuro |
| Display numérico | contador/valor analógico | Pro futuro |
| Botão reset de falha | reset de alarme | Free/Pro conforme uso |

## 11. Relés, proteções e permissivos

| Elemento | Função | Free/Pro |
|---|---|---|
| Relé auxiliar | memória/contato auxiliar | Free |
| Relé térmico | proteção de motor | Free para exemplo; Pro configurável |
| Permissivo | condição necessária | Free |
| Falha simulada | força condição de erro | Pro futuro |
| Intertravamento elétrico/lógico | impede comandos conflitantes | Free básico; Pro avançado |

## 12. Sequência e máquina de estados

| Elemento | Função | Free/Pro |
|---|---|---|
| Etapa | estado de uma sequência | Pro futuro |
| Transição | condição entre etapas | Pro futuro |
| Ação | saída ativa na etapa | Pro futuro |
| Reset de sequência | volta à etapa inicial | Pro futuro |
| Modo manual/auto | alterna comando | Pro futuro |

## 13. Debug e diagnóstico

| Recurso | Função | Free/Pro |
|---|---|---|
| Estado de entrada | mostra I0/I1/I2... | Free |
| Estado de saída | mostra Q0/Q1... | Free |
| Linha energizada | destaca rung ativa | Free |
| Explicação do estado | texto didático | Free |
| Contato que bloqueia | identifica por que não ligou | Pro futuro |
| Ciclo a ciclo | executa scan passo a passo | Pro futuro |
| Aviso de bobina duplicada | alerta escrita conflitante | Pro futuro |
| Aviso de SET sem RESET | alerta latch sem reset | Pro futuro |
| Histórico de eventos | lista ações da simulação | Pro futuro |

## 14. Projetos e arquivos

| Recurso | Função | Free/Pro |
|---|---|---|
| Abrir exemplo pronto | estudar projeto existente | Free |
| Simular exemplo pronto | testar projeto educativo | Free |
| Criar projeto próprio | editar do zero | Pro |
| Salvar projeto | persistência local | Pro |
| Duplicar projeto | criar cópia | Pro |
| Exportar imagem | compartilhar visual | Pro |
| Exportar PDF | relatório/estudo | Pro |
| Importar/exportar JSON | portabilidade futura | Pro futuro |

## 15. Categorias para menu lateral/inferior

No editor mobile, o painel de seleção deve ser dividido assim:

1. Entradas
2. Contatos
3. Bobinas
4. Temporizadores
5. Contadores
6. Motores
7. Painel/sinalização
8. Lógica avançada
9. Diagnóstico

## 16. Prioridade de implementação

### Implementar primeiro

- Botão de pulso NA.
- Botão de pulso NF.
- Botão fixo/chave seletora.
- Contato NA.
- Contato NF.
- Bobina Q.
- Memória M.
- Motor simples.
- Lâmpada piloto.
- Adicionar/remover componente em rung.
- Painel de edição do componente.

### Implementar depois

- SET.
- RESET.
- TON.
- TOF.
- CTU.
- Reversão de motor.
- Debug de contato bloqueando a linha.

### Implementar por último

- Analógicos.
- Comparadores completos.
- Matemática.
- SFC simplificado.
- Importação/exportação.
- Integração externa.

## 17. Observação importante

Este mapa não é uma promessa de implementação imediata. Ele é a referência de arquitetura e produto para guiar a evolução do CLP Fácil.

O simulador deve começar simples, funcionar bem no celular e crescer por módulos.
