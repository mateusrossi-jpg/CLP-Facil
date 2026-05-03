# Recursos Pro — CLP Fácil

## Decisão de produto

O CLP Fácil deve ser um simulador real, não apenas um app de lições. A versão gratuita precisa ser útil o suficiente para atrair usuários, estudantes e eletricistas, mas a versão paga deve liberar componentes avançados e recursos profissionais.

A monetização deve ser baseada em valor técnico adicional, não em limitar artificialmente o aprendizado básico.

## Estrutura recomendada

O app terá dois pilares:

1. **Aprender** — lições guiadas.
2. **Simular** — simulador com componentes montáveis.

Dentro dos dois pilares, haverá conteúdo gratuito e conteúdo Pro.

## Versão gratuita

A versão gratuita deve permitir montar e simular circuitos básicos.

### Componentes gratuitos

- Botão NA.
- Botão NF.
- Chave seletora simples.
- Emergência NF.
- Sensor NA.
- Sensor NF.
- Contato NA.
- Contato NF.
- Bobina Q.
- Memória M simples.
- Lâmpada piloto.
- Contator simples.
- Motor simples.

### Projetos gratuitos

- Contato NA acendendo lâmpada.
- Contato NF cortando saída.
- Partida direta simples.
- Partida direta com selo.
- Emergência cortando comando.
- Sobrecarga cortando motor.

## Versão Pro

A versão Pro deve liberar componentes e recursos avançados.

### Componentes Pro

- Temporizador TON.
- Temporizador TOF.
- Temporizador TP / Pulso.
- Contador CTU.
- Contador CTD.
- Reset de contador.
- Comparador simples.
- Intertravamento avançado.
- Partida estrela-triângulo completa.
- Reversão de motor completa.
- Bomba alternada.
- Sequenciamento de motores.
- Relé térmico configurável.
- Sinalizadores avançados.
- Chave fim de curso.
- Sensor de nível.
- Sensor de presença.

### Recursos Pro

- Salvar múltiplos projetos.
- Duplicar projetos.
- Exportar imagem/PDF.
- Biblioteca avançada de exemplos.
- Modo desafio avançado.
- Sem anúncios.
- Temas extras.
- Mais entradas e saídas por projeto.

## Estratégia de liberação

A versão gratuita deve ter limite suficiente para o usuário enxergar valor:

- até 2 ou 3 projetos salvos;
- componentes básicos liberados;
- simulações básicas ilimitadas;
- anúncios leves.

A versão Pro libera:

- projetos ilimitados;
- temporizadores;
- contadores;
- componentes avançados;
- exportação;
- sem anúncios.

## Modelo de pagamento recomendado

Inicialmente, usar compra vitalícia simples para remover anúncios e liberar Pro.

Possível estrutura futura:

- Free: básico com anúncios.
- Pro Vitalício: recursos avançados e sem anúncios.
- Educador/Institucional: pacotes de desafios e uso em sala.

## Tela de bloqueio Pro

Quando o usuário tocar em um componente Pro, o app deve explicar o valor sem ser agressivo.

Exemplo de mensagem:

```text
TON é um temporizador de atraso na energização.
Ele permite ligar uma saída somente depois que a entrada permanecer ativa pelo tempo configurado.

Este componente faz parte do CLP Fácil Pro.
```

Botões:

- Ver exemplo gratuito.
- Conhecer Pro.
- Voltar.

## Cuidados

- Não bloquear o aprendizado essencial.
- Não exagerar nos anúncios.
- Não prometer uso industrial real.
- Não copiar interface, marca ou materiais de outros apps.
- Manter foco em comandos elétricos e CLP/Ladder educativo.

## Prioridade de implementação Pro

Ordem sugerida:

1. Estrutura de componentes com campo `isPro`.
2. Biblioteca de componentes separando Free e Pro.
3. Tela/modal de componente Pro bloqueado.
4. TON visual bloqueado no início.
5. TOF visual bloqueado no início.
6. Contador CTU visual bloqueado no início.
7. Implementação real do TON.
8. Implementação real do TOF.
9. Implementação real do CTU.
10. Compra Pro e remoção de anúncios.
