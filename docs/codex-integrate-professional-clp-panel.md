# Integração do painel profissional CLP

Este arquivo orienta o próximo agente/Codex a encaixar o painel visual criado em `src/components/ProfessionalClpPanel.tsx` sem refatorar o simulador inteiro.

## Objetivo

Exibir no modo mobile compacto uma visão de CLP profissional com:

- tabela de tags: Tag, Tipo, Escopo, Valor, Descrição, Forçado;
- comentários por rung;
- alerta de segurança quando houver Force ON/OFF;
- visual limpo e utilizável no celular.

## Arquivos já prontos

- `src/simulation/professionalClpView.ts`
- `src/components/ProfessionalClpPanel.tsx`
- `src/simulation/rungOutputSummary.ts`
- `src/theme/codeContrast.ts`
- regressões em `src/simulation/smartphoneProgramViewRegression.ts`

## Integração recomendada

### 1. Importar o painel

Em `src/components/SmartphoneSimulationPanel.tsx`, adicionar:

```ts
import { ProfessionalClpPanel } from './ProfessionalClpPanel';
```

### 2. Inserir no bloco da aba Diagnóstico

Dentro do trecho:

```tsx
{activeTab === 'diagnostics' ? (
  <View style={styles.sectionStack}>
```

Logo após o card `Diagnóstico do scan`, adicionar:

```tsx
<ProfessionalClpPanel
  editorProject={editorProject}
  plcState={plcState}
/>
```

Nesta primeira fase, deixar `forces` e `rungComments` opcionais. O painel já funciona com padrão normal.

### 3. Depois evoluir para Force didático editável

Adicionar estados no `SmartphoneSimulationPanel` ou em um container acima:

```ts
const [educationalForces, setEducationalForces] = useState<EducationalForceMap>({});
const [rungComments, setRungComments] = useState<Record<string, string>>({});
```

E passar:

```tsx
<ProfessionalClpPanel
  editorProject={editorProject}
  plcState={plcState}
  forces={educationalForces}
  rungComments={rungComments}
/>
```

A edição visual do Force deve vir em outro bloco, após validar o painel somente leitura.

## Quality gate obrigatório

Após integrar:

```bash
npm run typecheck
npm run test:simulator
npm run test:quality
```

Não avançar se qualquer etapa falhar.
