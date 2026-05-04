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
- Proteção contra aba Ref vazia: `ReferenceHubPanel` aceita props opcionais e cria projeto didático fallback.
- GitHub Actions atualizado para rodar `typecheck`, `test:simulator` e `test:quality` em push, pull request e workflow manual.

## Concluído na interface

- Aba Referência com Dialetos, Mobile, Tags, Rotinas, Protocolos, Segurança, Divulgação e Loja.
- Aba Referência > Mobile com controle Compacto / Enquadrar / Amplo e orientação de Fluxo para rung grande.
- Aba Referência > Tags com tabela profissional, Force editável e comentários por rung editáveis.
- Aba Referência > Rotinas com organização profissional do projeto.
- Painel de trilha educativa atualizado com progresso, conclusão de lição e abertura de exemplo.
- Painel de exportação usando contraste centralizado no bloco de código.
- Painel de perfis com legenda didática por dialeto.
- BottomNavigation renderiza `ReferenceHubPanel` quando Ref está ativa, garantindo conteúdo visível mesmo se o render principal estiver incompleto.
- BottomNavigation renderiza `SimulationModeRouter` quando Simular está ativo, garantindo acesso visível à execução mobile mesmo antes de substituir o bloco clássico no `App.tsx`.
- Novo `SmartphoneProgramPanel` modular criado com Lista/Fluxo, Compacto/Enquadrar/Amplo, saída/carga fixa e arraste lateral preparado.
- Nova `MobileExecutionScreen` criada para reproduzir o conceito final da execução mobile: topo com RUN/AUTO/SCAN, navegação horizontal de I/Os, cards compactos, seletor Lista/Fluxo/Rung compacto e rodapé de diagnóstico.
- Novo `MobileSimulationEntryCard` criado para perguntar ao usuário se deseja abrir a execução mobile ou continuar no modo clássico.
- Novo `SimulationModeRouter` criado para alternar entre aviso, execução mobile e conteúdo clássico, com fallback seguro para projeto didático.

## Decisão de produto

- A simulação deve ter uma tela mobile própria, porque é o ambiente mais crítico no celular.
- Outros ambientes também podem ter telas próprias quando fizer sentido, mas não precisam virar telas separadas agora.
- O fluxo recomendado é: ao tocar em Simular no celular, mostrar um aviso oferecendo `Abrir execução mobile` ou `Continuar modo clássico`.
- No desktop/tablet, manter o modo clássico como padrão e oferecer a execução mobile como alternativa.

## Ainda pendente para fechamento visual/manual

- Confirmar o resultado do GitHub Actions após o próximo push ou execução manual.
- Testar no celular real:
  - Tocar em Ref e confirmar que não fica vazia.
  - Ref > Mobile.
  - Ref > Tags.
  - Ref > Rotinas.
  - Tocar em Simular e confirmar que aparece o aviso da execução mobile.
  - Abrir execução mobile e conferir I/Os horizontais.
  - Conferir modos Lista, Fluxo e Rung compacto.
  - Confirmar saída/carga fixa e rodapé de diagnóstico.
  - Conferir se o modo clássico ainda aparece/continua acessível.
  - Aba Hardware > 1 Placa / 2 Pinos / 3 Código.
  - Contraste do código gerado.
  - Trilha guiada e progresso.

## Próximo bloco recomendado

A próxima etapa ideal, quando o `App.tsx` puder ser editado com leitura completa, é substituir o bloco clássico interno da aba Simular por `src/components/SimulationModeRouter.tsx` passando os estados reais:

- `editorProject`;
- `editorState`;
- `editorEvaluation`;
- `selectedPlcProfile`;
- `editorMode === 'simulate'`;
- `autoScan`;
- `editorScanNumber`;
- conteúdo clássico como `classicContent`.

Depois disso, remover a renderização emergencial do `SimulationModeRouter` e do `ReferenceHubPanel` dentro do `BottomNavigation`, deixando essas telas renderizadas somente no bloco principal da aba.

## Critério de aceite

O pacote pode ser considerado fechado quando:

1. O typecheck passa.
2. `test:simulator` passa.
3. `test:quality` passa.
4. A aba Ref não fica vazia.
5. Ref > Mobile mostra Compacto / Enquadrar / Amplo.
6. Ref > Tags mostra tabela profissional, comentários e Force didático.
7. Ref > Rotinas mostra MainRoutine, MotorControl, SafetyLogic e Sequencer.
8. No celular, tocar em Simular oferece a execução mobile.
9. A execução mobile mostra I/Os horizontais, Lista/Fluxo/Rung compacto, saída/carga fixa e diagnóstico de scan.
10. Hardware mantém seleção de placa/pino separada da simulação.
11. Código exportado tem fundo escuro e texto claro.
