import { createInitialEditorProject } from '../engine/editorTypes';
import { PlcMissionTrack } from './missionTypes';

export const plcMissionTracks: PlcMissionTrack[] = [
  {
    id: 'fundamentos-clp',
    title: 'Trilha 1 — Fundamentos do CLP',
    description: 'Missões curtas para entender entrada, saída, contato, bobina e ciclo de scan.',
    missions: [
      {
        id: 'entrada-digital',
        title: 'O que é uma entrada',
        story: 'Um botão de campo chega ao CLP como um sinal de entrada.',
        objective: 'Acione I0.0 e observe o estado mudar para ON.',
        availableComponents: ['START'],
        validation: [{ type: 'scan_concept', input: 'I0.0', feedback: 'Correto. A entrada I0.0 representa o botão chegando ao CLP.' }],
        finalExplanation: 'Entradas são sinais lidos no começo do scan. O programa usa essa imagem para decidir as saídas.',
      },
      {
        id: 'saida-digital',
        title: 'O que é uma saída',
        story: 'O CLP precisa ligar uma carga simples para mostrar o resultado.',
        objective: 'Veja Q0.0 como a saída que representa motor, lâmpada ou relé.',
        availableComponents: ['MOTOR'],
        validation: [{ type: 'output_off_when_input_off', output: 'Q0.0', feedback: 'Boa. A saída fica visível na mesma tela para acompanhar o resultado.' }],
        finalExplanation: 'Saídas são atualizadas depois que a lógica Ladder é resolvida.',
      },
      {
        id: 'primeiro-contato-na',
        title: 'Primeiro contato NA',
        story: 'Você precisa ligar um motor usando uma botoeira de partida.',
        objective: 'Faça Q0.0 ligar quando I0.0 START estiver ON.',
        availableComponents: ['START', 'MOTOR'],
        initialProject: createInitialEditorProject(),
        validation: [{ type: 'output_on_when_input_on', input: 'I0.0', output: 'Q0.0', feedback: 'Correto. A saída Q0.0 ligou quando START foi acionado.' }],
        finalExplanation: 'Um contato NA conduz quando a entrada está ON. Assim a energia lógica chega até a bobina.',
      },
      {
        id: 'primeira-bobina',
        title: 'Primeira bobina',
        story: 'A bobina é o ponto onde o programa escreve a decisão de saída.',
        objective: 'Identifique Q0.0 como a bobina final da linha.',
        availableComponents: ['CONTATO NA', 'BOBINA'],
        validation: [{ type: 'output_on_when_input_on', input: 'I0.0', output: 'Q0.0', feedback: 'Perfeito. A bobina Q0.0 é escrita ao fim do rung.' }],
        finalExplanation: 'A bobina recebe o resultado da linha e atualiza a saída ou memória.',
      },
      {
        id: 'entendendo-scan',
        title: 'Entendendo o scan',
        story: 'O CLP repete: lê entradas, executa o programa e atualiza saídas.',
        objective: 'Acione START, execute Scan e observe entrada, rung e saída juntos.',
        availableComponents: ['START', 'MOTOR', 'SCAN'],
        validation: [{ type: 'scan_concept', input: 'I0.0', output: 'Q0.0', feedback: 'Isso é o ciclo: entrada lida, rung resolvido e saída atualizada.' }],
        finalExplanation: 'O scan é o coração do CLP. Por isso o simulador mostra I/O, rung e resultado na mesma tela.',
      },
    ],
  },
  {
    id: 'comandos-eletricos',
    title: 'Trilha 2 — Comandos elétricos',
    description: 'Partida, parada, selo, contator e diagnóstico de motor que não desliga.',
    missions: [
      {
        id: 'partida-simples',
        title: 'Partida simples',
        story: 'Um operador precisa acionar um motor por uma botoeira START.',
        objective: 'Ligue Q0.0 quando I0.0 estiver ON.',
        availableComponents: ['START', 'MOTOR'],
        validation: [{ type: 'output_on_when_input_on', input: 'I0.0', output: 'Q0.0', feedback: 'Partida simples validada.' }],
        finalExplanation: 'START permissivo energiza a bobina enquanto estiver pressionado.',
      },
      {
        id: 'stop-nf',
        title: 'Stop NF',
        story: 'A parada deve cortar o comando do motor.',
        objective: 'Garanta que I0.1 STOP bloqueie Q0.0.',
        availableComponents: ['START', 'STOP NF', 'MOTOR'],
        validation: [{ type: 'stop_blocks_output', stopInput: 'I0.1', output: 'Q0.0', feedback: 'Seguro. STOP bloqueou a saída do motor.' }],
        finalExplanation: 'O Stop NF é usado para segurança: quando abre, a linha deixa de conduzir.',
      },
      {
        id: 'selo',
        title: 'Selo',
        story: 'O motor deve continuar ligado depois que o operador soltar START.',
        objective: 'Use um contato auxiliar Q0.0 em paralelo com START.',
        availableComponents: ['START', 'STOP NF', 'CONTATO Q0.0', 'MOTOR'],
        validation: [{ type: 'custom', output: 'Q0.0', feedback: 'Selo montado: a saída mantém o comando até STOP atuar.' }],
        finalExplanation: 'O selo é uma retenção: a própria saída cria um caminho paralelo de manutenção.',
      },
      {
        id: 'motor-contator',
        title: 'Motor com contator',
        story: 'Na bancada, Q0.0 representa a bobina do contator KM1.',
        objective: 'Associe Q0.0 MOTOR/KM1 ao resultado do rung.',
        availableComponents: ['START', 'STOP NF', 'KM1'],
        validation: [{ type: 'output_on_when_input_on', input: 'I0.0', output: 'Q0.0', feedback: 'KM1 ligado pelo comando correto.' }],
        finalExplanation: 'No mundo real, o CLP aciona um relé ou contator, nunca uma carga grande direto no pino.',
      },
      {
        id: 'motor-nao-desliga',
        title: 'Motor não desliga',
        story: 'O motor ficou ligado e o aluno precisa descobrir por quê.',
        objective: 'Use diagnóstico para confirmar se STOP realmente corta o selo.',
        availableComponents: ['START', 'STOP NF', 'SELO', 'DIAGNÓSTICO'],
        validation: [{ type: 'stop_blocks_output', stopInput: 'I0.1', output: 'Q0.0', feedback: 'Diagnóstico correto: STOP precisa derrubar o selo.' }],
        finalExplanation: 'Quando um motor não desliga, revise Stop, selo em paralelo e duplicidade de bobina.',
      },
    ],
  },
  {
    id: 'temporizadores',
    title: 'Trilha 3 — Temporizadores',
    description: 'TON, retardo de partida, retardo no desligamento e sinalizador temporizado.',
    missions: [
      { id: 'ton-basico', title: 'TON básico', story: 'Uma saída só deve ligar depois de um tempo.', objective: 'Use TON para atrasar Q0.0.', availableComponents: ['START', 'TON', 'MOTOR'], validation: [{ type: 'custom', output: 'Q0.0', feedback: 'TON usado para temporizar a lógica.' }], finalExplanation: 'TON acumula tempo enquanto a entrada está verdadeira.' },
      { id: 'retardo-partida', title: 'Retardo na partida', story: 'O motor precisa esperar antes de partir.', objective: 'Faça o motor ligar após o preset.', availableComponents: ['START', 'TON', 'MOTOR'], validation: [{ type: 'custom', output: 'Q0.0', feedback: 'Retardo de partida aplicado.' }], finalExplanation: 'Retardo evita partida imediata e ajuda em sequências.' },
      { id: 'retardo-desligamento', title: 'Retardo no desligamento', story: 'A saída deve permanecer por alguns segundos.', objective: 'Treine a ideia de desligamento temporizado.', availableComponents: ['START', 'TOF', 'LÂMPADA'], validation: [{ type: 'custom', output: 'Q0.0', feedback: 'Retardo de desligamento entendido.' }], finalExplanation: 'TOF mantém a saída por um período depois da condição cair.' },
      { id: 'sinalizador-temporizado', title: 'Sinalizador temporizado', story: 'Uma lâmpada deve indicar espera ou alarme.', objective: 'Use timer para controlar um sinalizador.', availableComponents: ['SENSOR', 'TON', 'LÂMPADA'], validation: [{ type: 'custom', output: 'Q0.1', feedback: 'Sinalizador temporizado criado.' }], finalExplanation: 'Sinalizadores ajudam o operador a entender o estado da máquina.' },
    ],
  },
  {
    id: 'contadores',
    title: 'Trilha 4 — Contadores',
    description: 'Contagem de peças, reset, sensor e meta de produção.',
    missions: [
      { id: 'contador-pecas', title: 'Contador de peças', story: 'Um sensor detecta peças na esteira.', objective: 'Conte pulsos do sensor I0.2.', availableComponents: ['SENSOR', 'CTU'], validation: [{ type: 'custom', input: 'I0.2', feedback: 'Pulso contado pelo CTU.' }], finalExplanation: 'CTU soma uma unidade a cada borda válida do sensor.' },
      { id: 'reset-contador', title: 'Reset', story: 'O operador precisa zerar a contagem.', objective: 'Use uma entrada para resetar o contador.', availableComponents: ['SENSOR', 'RESET', 'CTU'], validation: [{ type: 'custom', feedback: 'Reset previsto para a contagem.' }], finalExplanation: 'Reset devolve o contador ao estado inicial.' },
      { id: 'sensor-contador', title: 'Sensor + contador', story: 'Cada peça passa por um sensor digital.', objective: 'Simule sensor e veja ACC mudar.', availableComponents: ['SENSOR', 'CTU', 'WATCH'], validation: [{ type: 'custom', input: 'I0.2', feedback: 'Sensor integrado ao contador.' }], finalExplanation: 'Sensores ruidosos podem exigir filtro ou debounce.' },
      { id: 'meta-producao', title: 'Meta de produção', story: 'A linha deve avisar quando chegar na meta.', objective: 'Ligue uma saída quando o contador atingir PRE.', availableComponents: ['SENSOR', 'CTU', 'LÂMPADA'], validation: [{ type: 'custom', output: 'Q0.1', feedback: 'Meta indicada por saída.' }], finalExplanation: 'Quando ACC alcança PRE, a lógica pode acionar um aviso.' },
    ],
  },
  {
    id: 'desafios-reais',
    title: 'Trilha 5 — Desafios reais',
    description: 'Projetos de bancada para aplicar fundamentos em situações comuns.',
    missions: [
      { id: 'semaforo', title: 'Semáforo', story: 'Três lâmpadas precisam alternar com segurança.', objective: 'Controle verde, amarelo e vermelho.', availableComponents: ['TON', 'Q0.0', 'Q0.1', 'Q0.2'], validation: [{ type: 'custom', feedback: 'Sequência de semáforo planejada.' }], finalExplanation: 'Semáforos treinam sequência, temporização e leitura de estados.' },
      { id: 'portao-automatico', title: 'Portão automático', story: 'Um portão deve abrir e fechar com fim de curso.', objective: 'Use comandos e sensores de posição.', availableComponents: ['ABRIR', 'FECHAR', 'FIM DE CURSO', 'MOTOR'], validation: [{ type: 'custom', feedback: 'Intertravamento do portão previsto.' }], finalExplanation: 'Portões exigem intertravamento e sensores de segurança.' },
      { id: 'bomba-poco', title: 'Bomba de poço', story: 'Uma bomba depende de nível e proteção.', objective: 'Ligue bomba apenas com permissivos válidos.', availableComponents: ['NÍVEL', 'BOMBA', 'ALARME'], validation: [{ type: 'custom', output: 'Q0.0', feedback: 'Bomba protegida por permissivos.' }], finalExplanation: 'Bombas reais precisam de proteção contra falta de água e sobrecarga.' },
      { id: 'esteira-simples', title: 'Esteira simples', story: 'A esteira move peças e conta produção.', objective: 'Combine motor, sensor e contador.', availableComponents: ['START', 'STOP', 'SENSOR', 'CTU', 'MOTOR'], validation: [{ type: 'custom', output: 'Q0.0', feedback: 'Esteira pronta para bancada didática.' }], finalExplanation: 'Esteiras juntam comando de motor, sensores e contagem.' },
      { id: 'alarme-retencao', title: 'Alarme com retenção', story: 'Um alarme deve permanecer ativo até reset.', objective: 'Use selo ou SET/RESET para retenção.', availableComponents: ['SENSOR', 'RESET', 'ALARME'], validation: [{ type: 'custom', output: 'Q0.1', feedback: 'Alarme com retenção previsto.' }], finalExplanation: 'Alarmes com retenção ajudam a não perder eventos rápidos.' },
    ],
  },
];

export function getFirstPlcMissionTrack(): PlcMissionTrack {
  return plcMissionTracks[0];
}
