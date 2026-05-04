import { EditorEvaluationResult } from '../engine/editorEvaluator';

export type GuidedPracticeStep = {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
};

function boolValue(evaluation: EditorEvaluationResult, variable: string) {
  return Boolean(evaluation.state[variable]);
}

function timerValue(evaluation: EditorEvaluationResult, blockId: string) {
  return evaluation.runtime.timers[blockId] ?? { elapsedMs: 0, q: false, previousIn: false };
}

function counterValue(evaluation: EditorEvaluationResult, blockId: string) {
  return evaluation.runtime.counters[blockId] ?? {
    currentValue: 0,
    q: false,
    previousCu: false,
    previousCd: false,
    previousReset: false,
  };
}

function step(id: string, label: string, hint: string, passed: boolean): GuidedPracticeStep {
  return { id, label, hint, passed };
}

export function getGuidedPracticeSteps(lessonId: string, evaluation: EditorEvaluationResult): GuidedPracticeStep[] {
  switch (lessonId) {
    case 'seal-circuit':
    case 'direct-start-with-seal':
    case 'direct-start-stop-button':
    case 'direct-start-emergency':
    case 'direct-start-overload':
      return [
        step('seal-start', 'Acione Start e rode um scan', 'I0.0 deve ligar Q0.0.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0')),
        step('seal-hold', 'Solte Start e confirme o selo', 'Q0.0 deve continuar ligado com I0.0 desligado.', !boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0')),
        step('seal-stop', 'Acione uma parada/proteção', 'Stop, emergência ou sobrecarga devem desligar Q0.0.', !boolValue(evaluation, 'Q0.0') && (boolValue(evaluation, 'I0.1') || boolValue(evaluation, 'I0.2') || boolValue(evaluation, 'I0.3'))),
      ];

    case 'normally-open-contact':
    case 'output-coil':
    case 'direct-start-simple':
      return [
        step('no-on', 'Ligue I0.0 e rode scan', 'Contato NA deve energizar Q0.0.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0')),
        step('no-off', 'Desligue I0.0 e rode scan', 'Bobina normal deve desligar Q0.0.', !boolValue(evaluation, 'I0.0') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'normally-closed-contact':
      return [
        step('nc-rest', 'Observe o contato NF em repouso', 'Com I0.1 desligado, Q0.0 deve ligar.', !boolValue(evaluation, 'I0.1') && boolValue(evaluation, 'Q0.0')),
        step('nc-open', 'Acione I0.1 e rode scan', 'Contato NF acionado deve abrir e desligar Q0.0.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'and-logic':
      return [
        step('and-one', 'Teste só uma entrada ligada', 'Com apenas I0.0 ou I0.2, Q0.0 deve ficar desligado.', !boolValue(evaluation, 'Q0.0') && (boolValue(evaluation, 'I0.0') !== boolValue(evaluation, 'I0.2'))),
        step('and-both', 'Ligue as duas entradas e rode scan', 'I0.0 e I0.2 juntos devem ligar Q0.0.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'I0.2') && boolValue(evaluation, 'Q0.0')),
      ];

    case 'or-logic':
      return [
        step('or-input', 'Ligue I0.0 e rode scan', 'Um caminho do paralelo deve ligar Q0.0.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0')),
        step('or-memory', 'Teste o ramo M0.0', 'M0.0 também deve ligar Q0.0 sem I0.0.', !boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'M0.0') && boolValue(evaluation, 'Q0.0')),
      ];

    case 'logical-interlock':
    case 'motor-reversing':
      return [
        step('rev-forward', 'Ligue avanço', 'Q0.0 deve ligar e Q0.1 deve ficar desligado.', boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1')),
        step('rev-block', 'Tente ligar reverso com avanço ativo', 'Intertravamento deve impedir Q0.1 junto com Q0.0.', boolValue(evaluation, 'I0.1') && boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1')),
        step('rev-reverse', 'Pare e teste reverso', 'Q0.1 deve ligar sem Q0.0.', boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'ton-delay': {
      const timer = timerValue(evaluation, 'ton-t0-block');
      return [
        step('ton-enable', 'Ligue I0 e inicie o TON', 'EN deve ficar ligado e ACC deve começar a subir.', boolValue(evaluation, 'I0') && timer.previousIn && timer.elapsedMs > 0),
        step('ton-done', 'Rode scans até atingir PRE', 'T0 e Q0 devem ligar após o tempo.', boolValue(evaluation, 'T0') && boolValue(evaluation, 'Q0') && timer.q),
        step('ton-reset', 'Desligue I0 para resetar', 'ACC deve voltar a zero e Q deve desligar.', !boolValue(evaluation, 'I0') && !boolValue(evaluation, 'T0') && timer.elapsedMs === 0),
      ];
    }

    case 'tof-delay': {
      const timer = timerValue(evaluation, 'tof-t0-block');
      return [
        step('tof-on', 'Ligue I0 e rode scan', 'TOF deve ligar Q imediatamente.', boolValue(evaluation, 'I0') && boolValue(evaluation, 'T0') && boolValue(evaluation, 'Q0')),
        step('tof-hold', 'Desligue I0 e observe o atraso', 'Q deve permanecer ligado enquanto ACC sobe.', !boolValue(evaluation, 'I0') && timer.elapsedMs > 0 && timer.q),
        step('tof-off', 'Continue rodando scans até desligar', 'Depois do PRE, T0 e Q0 devem desligar.', !boolValue(evaluation, 'I0') && !boolValue(evaluation, 'T0') && !boolValue(evaluation, 'Q0')),
      ];
    }

    case 'tp-pulse': {
      const timer = timerValue(evaluation, 'tp-t0-block');
      return [
        step('tp-trigger', 'Dispare I0', 'TP deve ligar Q ao disparar.', timer.q && boolValue(evaluation, 'Q0')),
        step('tp-running', 'Solte I0 durante o pulso', 'Q deve permanecer ligado pelo tempo preset.', !boolValue(evaluation, 'I0') && timer.q && boolValue(evaluation, 'Q0')),
        step('tp-finished', 'Rode scans até o pulso terminar', 'Q deve desligar sozinho.', !boolValue(evaluation, 'I0') && !timer.q && !boolValue(evaluation, 'Q0')),
      ];
    }

    case 'ctu-counter': {
      const counter = counterValue(evaluation, 'ctu-c0-block');
      return [
        step('ctu-first', 'Faça o primeiro pulso', 'ACC deve chegar a 1.', counter.currentValue >= 1),
        step('ctu-done', 'Conte até o preset', 'C0.Q e Q0.0 devem ligar ao atingir PRE.', counter.q && boolValue(evaluation, 'C0') && boolValue(evaluation, 'Q0.0')),
      ];
    }

    case 'ctd-counter': {
      const counter = counterValue(evaluation, 'ctd-c0-block');
      return [
        step('ctd-start', 'Faça o primeiro pulso', 'ACC deve sair do preset e começar a cair.', counter.currentValue > 0 && counter.currentValue < 3),
        step('ctd-zero', 'Conte até zero', 'C0.Q e Q0.0 devem ligar quando ACC chegar a zero.', counter.q && boolValue(evaluation, 'C0') && boolValue(evaluation, 'Q0.0')),
      ];
    }

    case 'ctud-counter': {
      const counter = counterValue(evaluation, 'ctud-c1');
      return [
        step('ctud-up', 'Pulse CU em I0.0', 'ACC deve subir.', counter.currentValue >= 1),
        step('ctud-done', 'Conte até o preset', 'C1 e Q0.0 devem ligar.', counter.q && boolValue(evaluation, 'C1') && boolValue(evaluation, 'Q0.0')),
        step('ctud-down', 'Pulse CD em I0.1', 'ACC deve diminuir e Q pode desligar.', counter.currentValue === 1 && !boolValue(evaluation, 'C1')),
        step('ctud-reset', 'Acione M0.0 para resetar', 'ACC deve voltar a zero.', boolValue(evaluation, 'M0.0') && counter.currentValue === 0),
      ];
    }

    case 'compare-equ':
      return [
        step('cmp-set', 'Defina N0 como 10', 'N0 precisa ser igual a 10.', evaluation.state.N0 === 10),
        step('cmp-on', 'Rode scan e observe Q0.0', 'EQU verdadeiro deve ligar Q0.0.', evaluation.state.N0 === 10 && boolValue(evaluation, 'Q0.0')),
      ];

    case 'math-add-mov':
      return [
        step('math-run', 'Ligue I0.0 e rode a soma', 'N2 deve receber N0 + N1.', boolValue(evaluation, 'I0.0') && Number(evaluation.state.N2) === Number(evaluation.state.N0 ?? 0) + Number(evaluation.state.N1 ?? 0)),
        step('math-limit', 'Faça N2 chegar a 10 ou mais', 'Comparador deve ligar Q0.0.', Number(evaluation.state.N2 ?? 0) >= 10 && boolValue(evaluation, 'Q0.0')),
      ];

    case 'edge-contacts':
      return [
        step('edge-pulse', 'Ligue I0.0 e rode um scan', 'Q0.0 deve ligar no scan da borda.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0')),
        step('edge-clear', 'Rode outro scan mantendo I0.0 ligado', 'Q0.0 deve desligar após a borda.', boolValue(evaluation, 'I0.0') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'set-reset-coils':
      return [
        step('set-memory', 'Acione SET com I0.0', 'M0.0 deve ligar e permanecer ligado.', boolValue(evaluation, 'M0.0') && boolValue(evaluation, 'Q0.0')),
        step('reset-memory', 'Acione RESET com I0.1', 'M0.0 e Q0.0 devem desligar.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'M0.0') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'star-delta':
      return [
        step('sd-star', 'Ligue Start e observe estrela', 'K1 e K2 devem ligar antes do tempo.', boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2')),
        step('sd-delta', 'Rode scans até T1 terminar', 'K2 deve desligar e K3 deve ligar.', boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2')),
      ];

    case 'reversing-star-delta':
      return [
        step('rsd-forward-star', 'Comande avanço e observe estrela', 'K1 avanço e K3 estrela devem ligar, sem reverso.', boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2') && !boolValue(evaluation, 'Q0.3')),
        step('rsd-forward-delta', 'Rode scans até triângulo em avanço', 'K3 deve cair e K4 triângulo deve ligar após T1.', boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2') && boolValue(evaluation, 'Q0.3') && boolValue(evaluation, 'T1')),
        step('rsd-reverse-star', 'Comande reverso sem usar Stop', 'K2 reverso deve assumir sem K1, reiniciando em estrela.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2') && !boolValue(evaluation, 'Q0.3')),
        step('rsd-reverse-delta', 'Rode scans até triângulo em reverso', 'T2 deve finalizar e K4 triângulo deve ligar no reverso.', !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2') && boolValue(evaluation, 'Q0.3') && boolValue(evaluation, 'T2')),
      ];

    case 'reversing-star-delta-tof':
      return [
        step('rsdt-forward', 'Comande avanço', 'K1 deve ligar e iniciar a sequência em estrela.', boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.2')),
        step('rsdt-deadtime', 'Peça reverso sem Stop', 'K1 deve cair, T3 deve manter bloqueio e K2 ainda deve ficar desligado.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'T3') && !boolValue(evaluation, 'Q0.1')),
        step('rsdt-reverse-release', 'Rode scans até o TOF liberar', 'Quando T3 cair, K2 pode entrar e reiniciar em estrela.', !boolValue(evaluation, 'T3') && boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2')),
        step('rsdt-reverse-delta', 'Continue até triângulo reverso', 'T2 deve finalizar e K4 deve ligar no sentido reverso.', boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'T2') && boolValue(evaluation, 'Q0.3')),
      ];

    case 'pump-level-control':
      return [
        step('pump-request', 'Acione nível baixo', 'M0.0 deve memorizar o pedido e Q0.0 deve ligar.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'M0.0') && boolValue(evaluation, 'Q0.0')),
        step('pump-high-reset', 'Acione nível alto', 'O reset deve desligar M0.0 e a bomba.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'M0.0') && !boolValue(evaluation, 'Q0.0')),
        step('pump-overload', 'Teste sobrecarga', 'A proteção deve derrubar a saída da bomba.', boolValue(evaluation, 'I0.2') && !boolValue(evaluation, 'Q0.0')),
      ];

    case 'conveyor-batch-counter': {
      const counter = counterValue(evaluation, 'conv-c0-counter');
      return [
        step('conv-run', 'Libere a esteira', 'Com lote incompleto, Q0.1 deve ligar.', boolValue(evaluation, 'I0.2') && !boolValue(evaluation, 'C0') && boolValue(evaluation, 'Q0.1')),
        step('conv-batch-done', 'Conte até fechar lote', 'C0 e Q0.0 devem ligar, e a esteira deve parar.', counter.q && boolValue(evaluation, 'C0') && boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1')),
        step('conv-reset', 'Acione reset do lote', 'C0 deve zerar e a esteira pode voltar a liberar.', boolValue(evaluation, 'I0.1') && counter.currentValue === 0 && !boolValue(evaluation, 'C0')),
      ];
    }

    case 'sequential-motors':
      return [
        step('seq-m1', 'Acione Start', 'O ciclo deve memorizar e M1 deve ligar.', boolValue(evaluation, 'M0.0') && boolValue(evaluation, 'Q0.0')),
        step('seq-m2', 'Rode scans até T0 concluir', 'M2 deve ligar depois do primeiro atraso.', boolValue(evaluation, 'T0') && boolValue(evaluation, 'Q0.1')),
        step('seq-m3', 'Rode scans até T1 concluir', 'M3 deve ligar depois do segundo atraso.', boolValue(evaluation, 'T1') && boolValue(evaluation, 'Q0.2')),
        step('seq-stop', 'Acione Stop', 'A memória de ciclo deve desligar.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'M0.0')),
      ];

    case 'traffic-light-sequence':
      return [
        step('tl-green', 'Ligue o ciclo', 'Verde deve ligar antes de T0 terminar.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'Q0.0') && !boolValue(evaluation, 'Q0.1')),
        step('tl-yellow', 'Rode scans até T0', 'Amarelo deve ligar após T0 e antes de T1.', boolValue(evaluation, 'T0') && boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2')),
        step('tl-red', 'Rode scans até T1', 'Vermelho deve ligar quando T1 terminar.', boolValue(evaluation, 'T1') && boolValue(evaluation, 'Q0.2')),
      ];

    case 'compressor-pressure':
      return [
        step('cmp-request', 'Acione pressão baixa', 'Pedido e compressor devem ligar.', boolValue(evaluation, 'I0.0') && boolValue(evaluation, 'M0.0') && boolValue(evaluation, 'Q0.0')),
        step('cmp-ready', 'Rode scans até estabilizar', 'T0 deve ligar o sinal pronto.', boolValue(evaluation, 'T0') && boolValue(evaluation, 'Q0.1')),
        step('cmp-high-reset', 'Acione pressão alta', 'Pedido e compressor devem desligar.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'M0.0') && !boolValue(evaluation, 'Q0.0')),
        step('cmp-overload', 'Teste proteção', 'Sobrecarga deve derrubar o compressor.', boolValue(evaluation, 'I0.2') && !boolValue(evaluation, 'Q0.0')),
      ];

    default:
      return [
        step('generic-scan', 'Entre em Simular e rode um scan', 'Observe a saída e compare com o resultado esperado.', evaluation.scanNumber > 0),
      ];
  }
}
