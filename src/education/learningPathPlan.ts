export type LearningPathModuleId =
  | 'fundamentals'
  | 'commands'
  | 'timers_counters'
  | 'motors'
  | 'processes'
  | 'hardware_lab';

export type LearningPathLesson = {
  id: string;
  title: string;
  objective: string;
  whyItMatters: string;
  practice: string;
  masteryCheck: string;
};

export type LearningPathModule = {
  id: LearningPathModuleId;
  title: string;
  description: string;
  lessons: LearningPathLesson[];
};

export const duolingoStyleLearningPath: LearningPathModule[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentos Ladder',
    description: 'Começa do zero: contato NA, contato NF, bobina e ciclo de scan.',
    lessons: [
      {
        id: 'lp-no-contact',
        title: 'Contato normalmente aberto',
        objective: 'Entender quando um contato NA conduz.',
        whyItMatters: 'É a base para representar botoeiras, sensores e permissões.',
        practice: 'Ligar I0.0 e observar Q0.0 energizar.',
        masteryCheck: 'O aluno explica por que Q0.0 desliga quando I0.0 desliga.',
      },
      {
        id: 'lp-nc-contact',
        title: 'Contato normalmente fechado',
        objective: 'Entender parada, emergência e proteção em lógica NF.',
        whyItMatters: 'Em comandos elétricos, paradas e proteções costumam abrir o circuito.',
        practice: 'Acionar I0.1 e observar o circuito abrir.',
        masteryCheck: 'O aluno identifica por que contato NF ligado no campo abre na lógica.',
      },
      {
        id: 'lp-scan-cycle',
        title: 'Ciclo de scan',
        objective: 'Entender leitura de entradas, execução e escrita de saídas.',
        whyItMatters: 'Explica bordas, timers, contadores e diferença entre estado e pulso.',
        practice: 'Rodar scans manuais e observar mudanças passo a passo.',
        masteryCheck: 'O aluno descreve a ordem: ler, executar, escrever.',
      },
    ],
  },
  {
    id: 'commands',
    title: 'Comandos elétricos',
    description: 'Selo, stop, emergência, sobrecarga e intertravamentos.',
    lessons: [
      {
        id: 'lp-seal',
        title: 'Partida com selo',
        objective: 'Montar e testar retenção por contato auxiliar.',
        whyItMatters: 'É o circuito clássico de partida direta e base de muitos comandos.',
        practice: 'Acionar Start, soltar Start e parar pelo Stop.',
        masteryCheck: 'O aluno explica por que o motor permanece ligado sem o botão Start.',
      },
      {
        id: 'lp-interlock',
        title: 'Intertravamento',
        objective: 'Impedir duas saídas conflitantes ao mesmo tempo.',
        whyItMatters: 'Evita curto, comandos simultâneos e falhas em reversão de motor.',
        practice: 'Tentar ligar avanço e reverso simultaneamente.',
        masteryCheck: 'O aluno mostra qual contato bloqueia a saída oposta.',
      },
    ],
  },
  {
    id: 'timers_counters',
    title: 'Timers e contadores',
    description: 'TON, TOF, TP, CTU, CTD e CTUD com exemplos práticos.',
    lessons: [
      {
        id: 'lp-ton',
        title: 'Temporizador TON',
        objective: 'Atrasar o acionamento de uma saída.',
        whyItMatters: 'Usado em partidas, sequências e temporizações de processo.',
        practice: 'Manter entrada ligada até ACC atingir PRE.',
        masteryCheck: 'O aluno explica EN, TT/DN e acumulador.',
      },
      {
        id: 'lp-ctu',
        title: 'Contador CTU',
        objective: 'Contar pulsos de uma entrada.',
        whyItMatters: 'Serve para produção, lote, peças e eventos discretos.',
        practice: 'Pulsar I0.0 até atingir preset.',
        masteryCheck: 'O aluno diferencia nível contínuo de borda de contagem.',
      },
    ],
  },
  {
    id: 'motors',
    title: 'Motores',
    description: 'Reversão, estrela-triângulo e sequências mais completas.',
    lessons: [
      {
        id: 'lp-reversing',
        title: 'Motor reversor',
        objective: 'Controlar avanço/reverso com intertravamento.',
        whyItMatters: 'É um dos exercícios mais importantes em comandos elétricos.',
        practice: 'Ligar avanço, bloquear reverso, parar e ligar reverso.',
        masteryCheck: 'O aluno identifica intertravamento lógico e físico.',
      },
      {
        id: 'lp-star-delta',
        title: 'Estrela-triângulo',
        objective: 'Entender transição temporizada entre estrela e triângulo.',
        whyItMatters: 'Mostra temporização, sequência e prevenção de saídas conflitantes.',
        practice: 'Observar K estrela cair antes de K triângulo ligar.',
        masteryCheck: 'O aluno explica por que estrela e triângulo não podem fechar juntos.',
      },
    ],
  },
  {
    id: 'processes',
    title: 'Processos didáticos',
    description: 'Bomba de nível, esteira com lote e semáforo.',
    lessons: [
      {
        id: 'lp-pump',
        title: 'Bomba por nível',
        objective: 'Controlar bomba com nível baixo, nível alto e sobrecarga.',
        whyItMatters: 'Aproxima o aluno de uma aplicação real simples.',
        practice: 'Acionar nível baixo, nível alto e proteção.',
        masteryCheck: 'O aluno explica memória de pedido e reset por nível alto.',
      },
      {
        id: 'lp-conveyor',
        title: 'Esteira com lote',
        objective: 'Usar contador para parar uma esteira ao atingir quantidade.',
        whyItMatters: 'Mostra aplicação direta de contador em processo.',
        practice: 'Contar peças até fechar lote e resetar.',
        masteryCheck: 'O aluno explica por que a esteira para quando C0.Q liga.',
      },
    ],
  },
  {
    id: 'hardware_lab',
    title: 'Bancada com microcontrolador',
    description: 'Escolha de placa, GPIO, relé, segurança e exportação.',
    lessons: [
      {
        id: 'lp-gpio',
        title: 'Escolhendo GPIO correto',
        objective: 'Selecionar entrada e saída sem usar pino reservado ou perigoso.',
        whyItMatters: 'Evita falha de boot e acionamento indevido de relé.',
        practice: 'Mapear I0.0 e Q0.0 em pinos recomendados.',
        masteryCheck: 'O aluno sabe por que GPIO34 não pode ser saída no ESP32 clássico.',
      },
      {
        id: 'lp-export',
        title: 'Exportando código',
        objective: 'Gerar Arduino/ESP32 C++ ou ESPHome YAML para bancada.',
        whyItMatters: 'Fecha o ciclo aprender → simular → testar em hardware didático.',
        practice: 'Gerar código de partida com selo.',
        masteryCheck: 'O aluno identifica limitações de segurança antes de ligar carga real.',
      },
    ],
  },
];

export function totalLearningPathLessons() {
  return duolingoStyleLearningPath.reduce((total, module) => total + module.lessons.length, 0);
}
