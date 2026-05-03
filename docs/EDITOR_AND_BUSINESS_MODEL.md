# Editor visual e modelo de negócio — CLP Fácil

## Decisão principal

O CLP Fácil deve unir dois mundos:

1. **Educação livre** — todo o conteúdo didático deve ser gratuito e de fácil acesso.
2. **Simulador profissional/Pro** — o uso do app como ferramenta para montar, editar, salvar e simular projetos próprios pode ser monetizado.

A parte educacional ajuda estudantes, professores e técnicos iniciantes. A parte de simulador financia a evolução do produto.

## Modelo de acesso

### Livre/gratuito

- Todas as lições teóricas.
- Explicações de contato NA, NF, bobina, selo, intertravamento, TON, TOF e contadores.
- Visualização de exemplos prontos.
- Simulação de exemplos básicos fornecidos pelo app.
- Material educativo de comandos elétricos e CLP.

### Pro/pago

- Criar projetos próprios.
- Salvar múltiplos projetos.
- Editar linhas Ladder livremente.
- Usar TON.
- Usar TOF.
- Usar TP/Pulso.
- Usar CTU/CTD.
- Usar SET/RESET avançado.
- Usar blocos de partida estrela-triângulo.
- Usar reversão de motor completa.
- Exportar imagem/PDF.
- Remover anúncios.

## Referência de experiência

O app deve seguir a ideia de simuladores onde o usuário escolhe componentes em uma biblioteca lateral e insere no projeto.

A referência conceitual é:

- painel lateral de componentes;
- componentes organizados por categoria;
- inserir componente na linha selecionada;
- adicionar novas linhas/rungs;
- editar parâmetros ao tocar em um componente;
- remover elementos do circuito;
- alternar entre modo edição e modo simulação.

Não copiar marca, layout, código, nomes internos, ícones ou materiais de outros apps. A identidade visual do CLP Fácil deve ser própria.

## Fluxo ideal do simulador

### 1. Tela de projetos

- Projetos de exemplo gratuitos.
- Botão criar projeto próprio, marcado como Pro.
- Projetos salvos pelo usuário, no futuro.

### 2. Editor Ladder

- Área central com rungs/linhas.
- Painel lateral ou inferior com biblioteca de componentes.
- Seleção de uma linha ativa.
- Inserção de componente na linha ativa.
- Inserção de ramo paralelo.
- Botão adicionar rung.
- Botão remover componente.
- Botão alternar entre Editar e Simular.

### 3. Edição de componente

Ao tocar em um componente, abrir painel de edição:

- nome/alias;
- variável associada;
- tipo de contato: NA/NF;
- modo de bobina: normal, SET, RESET;
- tempo, quando for temporizador;
- preset, quando for contador;
- observação educativa do funcionamento.

### 4. Simulação

- Bloquear edição durante simulação.
- Permitir acionar entradas virtuais.
- Mostrar linhas energizadas.
- Mostrar saídas ativas.
- Mostrar motores, contatores e sinalizadores.
- Explicar por que uma linha energizou ou não.

## Componentes do editor

### Gratuitos

- Contato NA.
- Contato NF.
- Bobina simples.
- Botão NA.
- Botão NF.
- Chave seletora.
- Emergência NF.
- Contator simples.
- Motor simples.
- Lâmpada piloto.

### Pro

- Bobina SET.
- Bobina RESET.
- TON.
- TOF.
- TP/Pulso.
- CTU.
- CTD.
- Reset de contador.
- Comparadores.
- Bloco estrela-triângulo.
- Bloco reversão de motor.
- Bomba alternada.
- Sequenciamento de motores.

## Primeira implementação recomendada

Para celular, começar sem arrastar real inicialmente, usando toque:

1. Usuário seleciona uma linha/rung.
2. Abre painel lateral/inferior de componentes.
3. Toca em um componente.
4. O app adiciona o componente na linha selecionada.
5. Toca no componente inserido para editar.
6. Toca em remover para excluir.

Depois evoluir para drag-and-drop quando a base estiver estável.

## Modo educacional livre

A educação deve continuar livre:

- o usuário pode aprender TON mesmo sem Pro;
- o usuário pode ver exemplos e entender o funcionamento;
- o bloqueio Pro entra quando ele quiser usar TON/TOF/CTU em projetos próprios ou salvar projetos avançados.

Isso cria valor, gera confiança e mantém o app acessível para estudantes.

## Mensagem de bloqueio Pro

Exemplo:

```text
Este componente é Pro para uso em projetos próprios.

Você pode estudar o funcionamento dele gratuitamente no modo Aprender, mas para usar em seus próprios circuitos no simulador é necessário desbloquear o CLP Fácil Pro.
```

## Prioridade de desenvolvimento

1. Separar Educação livre de Simulador Pro.
2. Criar modo de edição visual com painel de componentes.
3. Permitir seleção de componente.
4. Permitir painel de edição ao tocar no componente.
5. Adicionar e remover blocos básicos.
6. Bloquear componentes Pro no editor.
7. Implementar TON real.
8. Implementar TOF real.
9. Implementar CTU real.
10. Monetização/compra Pro.
