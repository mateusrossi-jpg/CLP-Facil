import type { ClpLesson } from './clpLessonCatalog';

export type GuidedPracticeStep = {
  id: string;
  title: string;
  instruction: string;
  expectedObservation: string;
};

export type GuidedPractice = {
  lessonId: ClpLesson['id'];
  projectId?: string;
  title: string;
  objective: string;
  steps: GuidedPracticeStep[];
};

export const clpGuidedPractices: GuidedPractice[] = [
  {
    lessonId: 'before-clp',
    projectId: 'partida-direta',
    title: 'Comparar relé e Ladder',
    objective: 'Entender como contatos e bobinas do comando elétrico aparecem na lógica Ladder.',
    steps: [
      {
        id: 'identify-contact',
        title: 'Identifique o contato',
        instruction: 'Observe o botão de partida no projeto e encontre o contato correspondente no rung.',
        expectedObservation: 'O contato de partida aparece como uma condição lógica antes da bobina.',
      },
      {
        id: 'identify-coil',
        title: 'Identifique a bobina',
        instruction: 'Localize a saída do motor/contator no final da linha.',
        expectedObservation: 'A bobina representa a saída acionada quando as condições da linha são verdadeiras.',
      },
      {
        id: 'compare-wiring',
        title: 'Compare com comando cabeado',
        instruction: 'Imagine a mesma lógica montada com fios, relés e contatores em painel.',
        expectedObservation: 'O Ladder reduz alterações físicas porque a lógica pode ser modificada por software.',
      },
    ],
  },
  {
    lessonId: 'scan-cycle',
    projectId: 'selo',
    title: 'Observar o ciclo de scan',
    objective: 'Acompanhar a ordem ler entradas, executar lógica e atualizar saídas.',
    steps: [
      {
        id: 'toggle-start',
        title: 'Acione a partida',
        instruction: 'Ligue a entrada de partida e observe a linha ativa no diagnóstico.',
        expectedObservation: 'A linha que contém a partida fica verdadeira durante o scan.',
      },
      {
        id: 'watch-output',
        title: 'Observe a saída',
        instruction: 'Veja quando a saída Q0.0 muda para ON no rodapé de diagnóstico.',
        expectedObservation: 'A saída é atualizada depois que a lógica da linha é executada.',
      },
      {
        id: 'repeat-cycle',
        title: 'Repita o ciclo',
        instruction: 'Alterne a entrada e veja o número do scan avançar.',
        expectedObservation: 'Cada ciclo reavalia entradas, rungs e saídas.',
      },
    ],
  },
  {
    lessonId: 'seal-in-circuit',
    projectId: 'selo',
    title: 'Praticar partida com selo',
    objective: 'Ver como uma saída permanece ligada depois que o botão momentâneo é solto.',
    steps: [
      {
        id: 'press-start',
        title: 'Pressione START',
        instruction: 'Acione I0.0 momentaneamente no painel de entradas.',
        expectedObservation: 'A bobina Q0.0 liga e o contato auxiliar de selo passa a manter a linha verdadeira.',
      },
      {
        id: 'release-start',
        title: 'Solte START',
        instruction: 'Desligue I0.0 e observe se Q0.0 permanece ligada.',
        expectedObservation: 'Q0.0 continua ON por causa do contato auxiliar em paralelo com a partida.',
      },
      {
        id: 'press-stop',
        title: 'Pressione STOP',
        instruction: 'Acione a parada e observe o comportamento do selo.',
        expectedObservation: 'A linha abre, Q0.0 desliga e o selo deixa de sustentar a saída.',
      },
    ],
  },
  {
    lessonId: 'interlock',
    projectId: 'reversao',
    title: 'Verificar intertravamento',
    objective: 'Entender por que avanço e reversão não podem ser ligados ao mesmo tempo.',
    steps: [
      {
        id: 'start-forward',
        title: 'Ligue avanço',
        instruction: 'Acione o comando de avanço e observe o contator K1.',
        expectedObservation: 'K1 liga e o caminho do reverso deve ficar bloqueado pelo intertravamento.',
      },
      {
        id: 'try-reverse',
        title: 'Tente reversão simultânea',
        instruction: 'Com avanço ligado, tente acionar o reverso.',
        expectedObservation: 'A lógica deve impedir que K2 ligue junto com K1.',
      },
      {
        id: 'stop-before-reverse',
        title: 'Pare antes de inverter',
        instruction: 'Desligue avanço, aguarde condição segura e só então acione reverso.',
        expectedObservation: 'A reversão só deve ocorrer sem conflito entre contatores.',
      },
    ],
  },
  {
    lessonId: 'timers-ton-tof',
    projectId: 'semaforo',
    title: 'Sequenciar com timers',
    objective: 'Visualizar como temporizadores criam transições de estado no semáforo.',
    steps: [
      {
        id: 'start-sequence',
        title: 'Inicie a sequência',
        instruction: 'Coloque a simulação em RUN/AUTO e acompanhe o primeiro timer.',
        expectedObservation: 'O timer começa a acumular tempo quando sua condição fica verdadeira.',
      },
      {
        id: 'watch-transition',
        title: 'Observe a transição',
        instruction: 'Veja quando a saída verde desliga e a próxima cor liga.',
        expectedObservation: 'A transição acontece após o tempo configurado.',
      },
      {
        id: 'compare-timers',
        title: 'Compare tempos',
        instruction: 'Altere mentalmente o tempo de uma etapa e preveja o efeito na sequência.',
        expectedObservation: 'A duração de cada estado depende diretamente do preset do temporizador.',
      },
    ],
  },
  {
    lessonId: 'force-safety',
    title: 'Analisar Force com segurança',
    objective: 'Entender por que Force deve ser tratado como ferramenta de diagnóstico supervisionado.',
    steps: [
      {
        id: 'inspect-force',
        title: 'Inspecione uma tag forçada',
        instruction: 'Abra Tags + Diagnóstico e localize uma tag em Force ON ou Force OFF.',
        expectedObservation: 'A tabela destaca que o valor não representa apenas a condição normal da lógica.',
      },
      {
        id: 'read-warning',
        title: 'Leia o alerta',
        instruction: 'Observe o alerta de segurança da tela de diagnóstico.',
        expectedObservation: 'O app reforça que Force em CLP real pode movimentar máquinas ou energizar saídas.',
      },
      {
        id: 'clear-force',
        title: 'Planeje a remoção do Force',
        instruction: 'Antes de limpar o Force, imagine quais saídas podem mudar de estado.',
        expectedObservation: 'A remoção do Force também pode alterar o processo e precisa ser planejada.',
      },
    ],
  },
];

export function getGuidedPracticeForLesson(lessonId: ClpLesson['id']): GuidedPractice | undefined {
  return clpGuidedPractices.find((practice) => practice.lessonId === lessonId);
}
