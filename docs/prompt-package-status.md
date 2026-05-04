# Status do pacote CLP Fácil / Easy CLP

Este documento registra o fechamento do pacote de evolução orientado pelo prompt mobile-first, profissional e educativo.

## Concluído no núcleo/testes

- Visualização mobile em Lista/Fluxo com resumo de saída/carga por rung.
- Modelo de zoom/enquadramento mobile: Compacto, Enquadrar e Amplo.
- Recomendação de Fluxo para rungs grandes.
- Perfis Easy-CLP, Rockwell-like, IEC-like e Comandos com símbolos essenciais.
- Regressões para XIC, XIO, OTE, P_TRIG, N_TRIG, S, R, OTL e OTU.
- Tabela profissional de tags: Tag, Tipo, Escopo, Valor, Descrição e Forçado.
- Force didático: Normal, Force ON e Force OFF, com alerta de segurança.
- Comentários por rung automáticos e editáveis no painel profissional.
- Modelo de rotinas profissionais: MainRoutine, MotorControl, SafetyLogic e Sequencer.
- Catálogo profissional de exemplos: partida direta, selo, reversão, estrela-triângulo, bomba alternada, semáforo, esteira, portão e reservatório.
- Trilha educativa com conceito, por que importa, prática e checagem de domínio.
- Progresso por módulo e progresso geral da trilha.
- Exportação Arduino/ESP32/ESPHome com validação de GPIO e código com alto contraste.
- Tokens centrais de contraste para código: fundo #020817 / #0B1220 e texto #F8FAFC.
- Checklist de release expandido para mobile, profissional, ensino, exemplos, hardware e referência.

## Concluído na interface

- Aba Referência com Dialetos, Mobile, Tags, Rotinas, Protocolos, Segurança, Divulgação e Loja.
- Aba Referência > Mobile com controle Compacto / Enquadrar / Amplo e orientação de Fluxo para rung grande.
- Aba Referência > Tags com tabela profissional, Force editável e comentários por rung editáveis.
- Aba Referência > Rotinas com organização profissional do projeto.
- Painel de trilha educativa atualizado com progresso, conclusão de lição e abertura de exemplo.
- Painel de exportação usando contraste centralizado no bloco de código.
- Painel de perfis com legenda didática por dialeto.

## Ainda pendente para fechamento visual/manual

- Rodar localmente:

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```

- Testar no celular real:
  - Simular > Programa > Lista.
  - Simular > Programa > Fluxo.
  - Saída/carga fixa do rung.
  - Arraste lateral real em rung grande.
  - Aba Ref > Mobile.
  - Aba Ref > Tags.
  - Aba Ref > Rotinas.
  - Aba Hardware > 1 Placa / 2 Pinos / 3 Código.
  - Contraste do código gerado.
  - Trilha guiada e progresso.

## Próximo bloco recomendado

A próxima etapa visual deve integrar os controles de zoom/enquadramento diretamente no `SmartphoneSimulationPanel.tsx`, usando o modelo `src/simulation/smartphoneViewScale.ts` e o componente `src/components/SmartphoneViewScaleControl.tsx`. Como esse arquivo é grande, fazer alteração mínima e testar imediatamente.

## Critério de aceite

O pacote pode ser considerado fechado quando:

1. O typecheck passa.
2. `test:simulator` passa.
3. `test:quality` passa.
4. No celular, rungs grandes têm arraste lateral real e saída/carga sempre visível.
5. Ref > Mobile mostra Compacto / Enquadrar / Amplo.
6. Ref > Tags mostra tabela profissional, comentários e Force didático.
7. Ref > Rotinas mostra MainRoutine, MotorControl, SafetyLogic e Sequencer.
8. Hardware mantém seleção de placa/pino separada da simulação.
9. Código exportado tem fundo escuro e texto claro.
