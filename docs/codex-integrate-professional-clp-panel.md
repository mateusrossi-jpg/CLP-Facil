# Integração do painel profissional CLP

Este guia fica como histórico técnico. O usuário não depende de Codex; as mudanças devem ser feitas diretamente pelo agente no repositório sempre que possível.

## Objetivo atual

Exibir no modo mobile compacto uma visão de CLP profissional com:

- tabela de tags: Tag, Tipo, Escopo, Valor, Descrição e Forçado;
- comentários por rung;
- alerta de segurança quando houver Force ON/OFF;
- visual limpo e utilizável no celular.

## Arquivos já prontos

- `src/simulation/professionalClpView.ts`
- `src/components/ProfessionalClpPanel.tsx`
- `src/simulation/rungOutputSummary.ts`
- `src/theme/codeContrast.ts`
- regressões em `src/simulation/smartphoneProgramViewRegression.ts`

## Integração segura

Quando for mexer em arquivos grandes como `SmartphoneSimulationPanel.tsx` ou `App.tsx`, buscar o conteúdo completo por blob/arquivo e aplicar a menor alteração possível.

Integração visual desejada:

```tsx
<ProfessionalClpPanel
  editorProject={editorProject}
  plcState={plcState}
/>
```

O ponto recomendado é a aba `Diagnóstico`, abaixo do card `Diagnóstico do scan`.

## Quality gate obrigatório

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```

Não avançar se qualquer etapa falhar.
