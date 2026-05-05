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
- GitHub Actions confirmado em `.github/workflows/quality-gate.yml` para rodar `typecheck`, `test:simulator` e `test:quality` em push, pull request e workflow manual.
- Paleta global migrada para o sistema dark premium: #020817, #07111F, #0B1220, #111827, #22D3EE, #22C55E e #F59E0B.
- Paleta global recebeu aliases de compatibilidade (`primary`, `success`, `warning`, `danger`, `blue`, `orange`, `gray`, `white`) para reduzir risco de quebra em componentes antigos durante a migração visual.
- Componentes base premium criados em `src/components/premium`: tokens, layout, cards, badges, métricas, progress bar, segmented control e action tiles.
- Barrel premium `src/components/premium/index.ts` agora exporta também shell, route content, detalhe de lição e telas premium para facilitar a integração final no `App.tsx`.
- `PremiumProgress` teve a largura percentual tipada para reduzir risco no TypeScript strict.
- Arquivo temporário `src/components/premium/test.txt` removido após criação da pasta premium.
- Tipo compartilhado `BottomNavKey` extraído para `src/components/navigationTypes.ts`.
- `BottomNavigation` e `PremiumRouteContent` usam o tipo compartilhado, eliminando dependência cruzada entre navegação e renderer premium.
- `BottomNavigation` reexporta `BottomNavKey` para manter compatibilidade com imports antigos após a extração do tipo.
- Novo catálogo educativo `src/education/clpLessonCatalog.ts` criado com módulos e lições estruturadas para História do CLP, Como o CLP funciona, Pensamento Ladder, Instruções essenciais, Aplicações reais e Diagnóstico.

## Concluído na interface

- BottomNavigation finalizado com rótulos premium: Início, Aprender, Simular, Projetos, Editor e Ref.
- BottomNavigation agora renderiza rotas premium por meio de `PremiumRouteContent`, centralizando o mapeamento visual das abas e reduzindo duplicidade.
- BottomNavigation recebeu prop opcional `renderContent`, mantendo comportamento atual por padrão e permitindo, no futuro, usar a barra separada do conteúdo premium no `App.tsx`.
- Novo `PremiumAppShell` criado para arquitetura final: renderiza `PremiumRouteContent` no corpo e usa `BottomNavigation renderContent={false}` como barra separada.
- `PremiumRouteContent` renderiza `PremiumHomeScreen`, `PremiumLearningScreen`, `SimulationModeRouter`, `PremiumProjectsScreen`, `PremiumEditorExportScreen`, `ReferenceHubPanel` e `PremiumTagsDiagnosticsScreen` conforme aba ativa.
- Aba Referência com Dialetos, Mobile, Tags, Rotinas, Protocolos, Segurança, Divulgação e Loja.
- Aba Referência > Mobile com controle Compacto / Enquadrar / Amplo e orientação de Fluxo para rung grande.
- Aba Referência > Tags com tabela profissional, Force editável e comentários por rung editáveis.
- Aba Referência > Rotinas com organização profissional do projeto.
- Painel de trilha educativa atualizado com progresso, conclusão de lição e abertura de exemplo.
- Painel de exportação usando contraste centralizado no bloco de código.
- Painel de perfis com legenda didática por dialeto.
- Novo `SmartphoneProgramPanel` modular criado com Lista/Fluxo, Compacto/Enquadrar/Amplo, saída/carga fixa e arraste lateral preparado.
- Nova `MobileExecutionScreen` criada como primeira versão funcional da execução mobile.
- Nova `MobileExecutionCockpit` criada como versão visual alinhada ao conceito aprovado: fundo #020817, cockpit escuro, header Easy-PLC, RUN/AUTO/SCAN, I/Os horizontais, cards compactos, seletor Lista/Fluxo/Rung compacto e rodapé de diagnóstico.
- `SimulationModeRouter` agora abre `MobileExecutionCockpit` na execução mobile, substituindo visualmente a primeira versão que estava distante do mockup.
- Novo `MobileSimulationEntryCard` criado para perguntar ao usuário se deseja abrir a execução mobile ou continuar no modo clássico.
- Novo `SimulationModeRouter` criado para alternar entre aviso, execução mobile e conteúdo clássico, com fallback seguro para projeto didático.
- Nova `PremiumHomeScreen` criada como conceito implementável da Home no padrão visual aprovado.
- Nova `PremiumLearningScreen` conectada ao catálogo real `clpLessonCatalog`, usando módulos, progresso, próximas lições e desafios gerados da estrutura educativa.
- Novo `PremiumLessonDetailCard` criado e exibido na tela Aprender para mostrar Conceito, Por que importa, Prática e Checagem de domínio da lição atual.
- Nova `PremiumProjectsScreen` criada para biblioteca premium de projetos/exemplos, com busca visual, filtros, projeto em destaque, cards de Partida direta, Selo, Reversão, Estrela-triângulo, Semáforo, Bomba alternada, Esteira e Portão.
- Nova `PremiumEditorExportScreen` criada para Editor Ladder + Exportação, com toolbar NA/NF/COIL/TON/CTU, rungs compactos, comentário do rung, tabs Arduino/ESP32/ESPHome, validação de GPIO e code preview escuro.
- Nova `PremiumTagsDiagnosticsScreen` criada para tabela de tags, Force didático, alerta de segurança, diagnóstico de scan, linha ativa, saída ativa e eventos recentes.

## Decisão de produto

- A simulação deve ter uma tela mobile própria, porque é o ambiente mais crítico no celular.
- Outros ambientes também podem ter telas próprias quando fizer sentido, mas não precisam virar telas separadas agora.
- O fluxo recomendado é: ao tocar em Simular no celular, mostrar um aviso oferecendo `Abrir execução mobile` ou `Continuar modo clássico`.
- No desktop/tablet, manter o modo clássico como padrão e oferecer a execução mobile como alternativa.
- A refatoração visual agora deve seguir tela por tela usando o kit premium: Home, Aprender, Simular, Projetos, Editor, Exportação e Tags/Diagnóstico.

## Fechamento estrutural do pacote visual

O pacote visual premium está estruturalmente fechado: as telas principais existem, estão conectadas na navegação final e seguem a mesma linguagem escura premium.

O workflow de quality gate existe e está configurado em `.github/workflows/quality-gate.yml`, mas o conector não retornou runs/status automáticos para o último commit. Portanto, o fechamento técnico final ainda depende de rodar localmente ou acionar o workflow manualmente no GitHub Actions:

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```

Se algum teste falhar, a próxima etapa deve ser somente correção de typecheck/regressão, sem adicionar novas telas.

## Ainda pendente para fechamento visual/manual

- Confirmar o resultado do GitHub Actions após execução manual ou próximo push.
- Testar no celular real:
  - Conferir se a paleta global dark não quebrou contraste em telas antigas.
  - Tocar em Início e conferir a `PremiumHomeScreen`.
  - Tocar em Aprender e conferir a `PremiumLearningScreen` com dados do catálogo educativo e detalhe de lição.
  - Tocar em Projetos e conferir a `PremiumProjectsScreen`.
  - Tocar em Editor e conferir a `PremiumEditorExportScreen`.
  - Tocar em Ref e confirmar que não fica vazia.
  - Conferir `PremiumTagsDiagnosticsScreen` na aba Ref.
  - Ref > Mobile.
  - Ref > Tags.
  - Ref > Rotinas.
  - Tocar em Simular e confirmar que aparece o aviso da execução mobile.
  - Abrir execução mobile e conferir a nova tela `MobileExecutionCockpit`.
  - Conferir se a execução mobile agora se aproxima do conceito visual aprovado.
  - Conferir I/Os horizontais.
  - Conferir modos Lista, Fluxo e Rung compacto.
  - Confirmar saída/carga fixa e rodapé de diagnóstico.
  - Conferir se o modo clássico ainda aparece/continua acessível.
  - Contraste do código gerado.
  - Trilha guiada e progresso.

## Próximo bloco recomendado

Rodar o quality gate e corrigir erros de TypeScript/contraste/regressão antes de continuar refinando o visual.

Quando o `App.tsx` puder ser editado com leitura completa, substituir o bloco clássico interno da aba Simular por `src/components/SimulationModeRouter.tsx` passando os estados reais:

- `editorProject`;
- `editorState`;
- `editorEvaluation`;
- `selectedPlcProfile`;
- `editorMode === 'simulate'`;
- `autoScan`;
- `editorScanNumber`;
- conteúdo clássico como `classicContent`.

Depois disso, mover `PremiumRouteContent` para o bloco principal do `App.tsx`, usar `BottomNavigation renderContent={false}` ou substituir o fluxo por `PremiumAppShell`, deixando `BottomNavigation` somente como barra de navegação.

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
9. A execução mobile mostra I/Os horizontais, Lista/Fluxo/Rung compacto, saída/carga fixa e diagnóstico de scan em visual escuro premium próximo ao conceito.
10. Home, Aprender, Projetos, Editor, Exportação e Tags seguem o mesmo sistema visual premium.
11. Código exportado tem fundo escuro e texto claro.
