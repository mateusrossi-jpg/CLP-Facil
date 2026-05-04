# CLP Facil / Easy CLP - Diretriz do agente

Este repositorio deve ser evoluido como um aplicativo mobile-first para ensino, simulacao e pratica de CLP/Ladder no smartphone.

## Objetivo

Construir um simulador CLP educativo com excelente experiencia em celular, utilidade real para estudantes, tecnicos e professores, perfis visuais Easy-CLP, Rockwell-like, IEC-like e Comandos eletricos, alem de exportacao didatica para Arduino, ESP32 e ESPHome.

## Regras fixas

1. Smartphone primeiro: telas limpas, responsivas e confortaveis no celular.
2. Rungs longos: devem ter arraste lateral real, zoom/enquadramento e resumo da carga/saida sempre visivel.
3. Ladder grande: sempre oferecer alternativa em Lista/Fluxo.
4. Perfis: trocar o perfil deve trocar nomes, simbolos e leitura didatica no simulador, nao apenas na referencia.
5. Simulacao mobile: manter abas Execucao, I/O, Programa e Diagnostico.
6. I/O: separar Entradas, Saidas, Memorias e Timers/Contadores.
7. Programa: cada linha deve mostrar estado, explicacao didatica e perfil visual ativo.
8. Ensino guiado: cada licao deve ter conceito, importancia, pratica e checagem de dominio.
9. Aparencia de CLP profissional: evoluir tabela de tags, comentarios por rung, force didatico e diagnostico claro.
10. Exportacao: placa e GPIO ficam em aba separada; codigo gerado deve usar fundo escuro e texto claro.
11. Visual: tema escuro, tecnico, moderno e responsivo.
12. Codigo: blocos de codigo usam fundo #020817 ou #0B1220 e texto #F8FAFC.
13. Implementacao: pequenos blocos, sem regressao visual, sem duplicidade de tela quebrada.
14. Qualidade: apos mudancas relevantes, validar typecheck, test:simulator e quality gate.

## Ordem atual de ataque

1. Corrigir definitivamente a visualizacao dos rungs no smartphone.
2. Garantir arraste lateral, zoom/enquadramento e carga/saida sempre visivel.
3. Garantir aba Ref com conteudo.
4. Garantir simbolos Rockwell/IEC/Comandos no simulador.
5. Corrigir contraste de blocos de codigo/bash.
6. Criar tabela de tags estilo CLP.
7. Criar comentarios por rung.
8. Criar force didatico.
9. Expandir exemplos prontos.
10. Evoluir trilha educativa com progresso.

## Comandos de qualidade

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```
