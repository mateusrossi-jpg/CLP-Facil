# CLP Fácil — Checklist de Beta Fechado

## Como rodar local
1. Instale dependências:
   ```bash
   npm install
   ```
2. Rode validações principais:
   ```bash
   npm run typecheck
   npm run test:simulator
   ```
3. Inicie a aplicação:
   ```bash
   npm run dev
   ```

## Como testar simulador
1. Abra o app no navegador (modo mobile responsivo recomendado).
2. Verifique abas e seções: Runtime, I/O, Ladder, Laboratório 2.5D e Exportar Hardware.
3. Alterne entre **EDIT** e **RUN/SIMULATE**.
4. Rode **SCAN** manual e depois **AUTO** para validar atualização contínua.

## Como testar primeira lógica
1. Inicie com projeto vazio.
2. Use os botões de ação para:
   - Adicionar rung
   - Adicionar contato
   - Adicionar bobina
3. Associe tags (por exemplo: `I0.0` e `Q0.0`).
4. Acione entrada em I/O e rode scan.
5. Confirme energização da saída e feedback visual do rung.

## Como testar Laboratório 2.5D
1. Abra a seção **Laboratório 2.5D**.
2. Troque entre cenários disponíveis (esteira, tanque, partida de motor, etc.).
3. Acione entradas e valide se elementos visuais reagem sem travar o app.
4. Confirme que o layout não quebra em viewport estreito.

## Como testar Exportar Hardware
1. Abra **Exportar Hardware**.
2. Gere exportações para:
   - Arduino ESP32
   - OpenPLC (Structured Text)
   - ESP-IDF
   - JSON técnico
3. Teste cópia de código no navegador.
4. Valide fluxo sem tags I/O (deve gerar placeholders seguros START/MOTOR).

## Como reportar bug
Inclua no relatório:
- Ambiente (SO, navegador, resolução/dispositivo)
- Branch e commit testado
- Passo a passo para reproduzir
- Resultado esperado vs resultado atual
- Print/vídeo curto (quando possível)
- Logs de console e erro de runtime

## Limitações conhecidas
- Exportações são didáticas e exigem revisão elétrica antes de uso real.
- Alguns comportamentos dependem de mapeamento de tags consistente (`I*`, `Q*`, `O*`).
- Fallback de cópia usa `document.execCommand('copy')` quando Clipboard API não está disponível.

## Próximas melhorias
- Mais diagnósticos guiados por rung para iniciantes.
- Mais templates de lógica prontos para uso em aula.
- Ajustes finos de microinterações no editor mobile.
- Cobertura adicional de testes E2E mobile.
