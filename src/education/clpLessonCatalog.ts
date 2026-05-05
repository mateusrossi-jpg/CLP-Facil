export type LessonDifficulty = 'intro' | 'basic' | 'intermediate' | 'advanced';

export type ClpLesson = {
  id: string;
  moduleId: string;
  title: string;
  shortTitle: string;
  difficulty: LessonDifficulty;
  durationMinutes: number;
  concept: string;
  whyItMatters: string;
  practice: string;
  masteryCheck: string;
  exampleProjectId?: string;
};

export type ClpLearningModule = {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: ClpLesson[];
};

export const clpLearningModules: ClpLearningModule[] = [
  {
    id: 'history',
    title: 'História do CLP',
    description: 'Entenda de onde o CLP veio e por que ele mudou a automação industrial.',
    progress: 15,
    lessons: [
      {
        id: 'before-clp',
        moduleId: 'history',
        title: 'Antes do CLP: comandos por relés',
        shortTitle: 'Antes do CLP',
        difficulty: 'intro',
        durationMinutes: 8,
        concept: 'Antes dos controladores programáveis, painéis de comando dependiam de relés, contatores, temporizadores eletromecânicos e muita fiação física.',
        whyItMatters: 'Compreender comandos cabeados ajuda o aluno a entender por que o Ladder se parece com um diagrama elétrico e por que o CLP facilitou manutenção e alterações.',
        practice: 'Compare um circuito de partida direta por relé com a mesma lógica escrita em Ladder.',
        masteryCheck: 'Explique qual parte do Ladder representa o contato, a bobina e o caminho lógico da energia.',
        exampleProjectId: 'partida-direta',
      },
      {
        id: 'why-plc-was-created',
        moduleId: 'history',
        title: 'Por que o CLP surgiu',
        shortTitle: 'Origem do CLP',
        difficulty: 'intro',
        durationMinutes: 9,
        concept: 'O CLP surgiu para substituir grandes painéis com lógica cabeada por um controlador programável, flexível e mais fácil de alterar.',
        whyItMatters: 'Esse contexto mostra que o CLP não é apenas software: ele nasceu de uma necessidade real de reduzir tempo de parada, custo de manutenção e complexidade de alteração.',
        practice: 'Liste três mudanças que seriam difíceis em um painel cabeado e simples em um programa Ladder.',
        masteryCheck: 'Diga por que uma fábrica ganha produtividade quando consegue alterar uma lógica por software.',
      },
      {
        id: 'plc-evolution',
        moduleId: 'history',
        title: 'Evolução: CLP compacto, modular e redes',
        shortTitle: 'Evolução do CLP',
        difficulty: 'basic',
        durationMinutes: 10,
        concept: 'Os CLPs evoluíram de controladores simples para sistemas compactos, modulares, conectados em rede e integrados a IHMs e supervisórios.',
        whyItMatters: 'Essa visão ajuda o aluno a enxergar o CLP como parte de um sistema maior: sensores, atuadores, redes, supervisão, manutenção e segurança.',
        practice: 'Monte mentalmente uma arquitetura com CLP, entradas, saídas, IHM e rede de comunicação.',
        masteryCheck: 'Identifique a diferença entre um CLP compacto e um modular.',
      },
    ],
  },
  {
    id: 'how-it-works',
    title: 'Como o CLP funciona',
    description: 'CPU, memória, entradas, saídas e o ciclo de scan.',
    progress: 28,
    lessons: [
      {
        id: 'plc-parts',
        moduleId: 'how-it-works',
        title: 'CPU, memória e módulos de I/O',
        shortTitle: 'Partes do CLP',
        difficulty: 'basic',
        durationMinutes: 10,
        concept: 'Um CLP possui CPU, memória, fonte, módulos de entrada, módulos de saída e interfaces de comunicação.',
        whyItMatters: 'Saber a função de cada parte evita confundir lógica de programa com fiação física ou defeito de campo.',
        practice: 'Associe cada sinal do projeto a uma entrada, memória interna ou saída.',
        masteryCheck: 'Explique a diferença entre uma entrada física, uma memória interna e uma saída física.',
      },
      {
        id: 'scan-cycle',
        moduleId: 'how-it-works',
        title: 'Ciclo de scan: ler, executar e atualizar',
        shortTitle: 'Ciclo de scan',
        difficulty: 'basic',
        durationMinutes: 12,
        concept: 'O CLP normalmente lê as entradas, executa o programa e atualiza as saídas em ciclos repetitivos chamados scans.',
        whyItMatters: 'Muitos comportamentos de temporizadores, bordas e diagnósticos dependem de entender que o programa é varrido em ciclos.',
        practice: 'Observe a simulação e identifique em qual linha uma saída muda de estado.',
        masteryCheck: 'Descreva a ordem básica do scan em três etapas.',
      },
      {
        id: 'retentive-memory',
        moduleId: 'how-it-works',
        title: 'Memória retentiva e estados internos',
        shortTitle: 'Memória',
        difficulty: 'intermediate',
        durationMinutes: 11,
        concept: 'Alguns estados podem ser mantidos mesmo após parada, queda de energia ou mudança de modo, dependendo da configuração do CLP.',
        whyItMatters: 'Em sistemas reais, retenção mal planejada pode religar máquinas de forma inesperada ou perder contagens importantes.',
        practice: 'Compare uma memória comum com uma memória usada para manter estado de processo.',
        masteryCheck: 'Dê um exemplo de quando reter uma memória é útil e outro em que pode ser perigoso.',
      },
    ],
  },
  {
    id: 'ladder-thinking',
    title: 'Pensamento Ladder',
    description: 'Da lógica elétrica ao raciocínio programável.',
    progress: 46,
    lessons: [
      {
        id: 'no-nc-coil',
        moduleId: 'ladder-thinking',
        title: 'Contato NA, contato NF e bobina',
        shortTitle: 'NA, NF e bobina',
        difficulty: 'basic',
        durationMinutes: 12,
        concept: 'O contato NA conduz quando a condição é verdadeira, o contato NF conduz quando a condição é falsa, e a bobina representa uma saída ou estado acionado pela linha.',
        whyItMatters: 'Esses três elementos formam a base de quase toda leitura Ladder inicial.',
        practice: 'Monte uma linha com botão de partida NA, parada NF e bobina do motor.',
        masteryCheck: 'Explique por que o botão de parada costuma aparecer como contato NF na lógica.',
        exampleProjectId: 'partida-direta',
      },
      {
        id: 'seal-in-circuit',
        moduleId: 'ladder-thinking',
        title: 'Selo: mantendo a saída ligada',
        shortTitle: 'Selo',
        difficulty: 'basic',
        durationMinutes: 14,
        concept: 'O selo usa um contato auxiliar da própria saída para manter a linha verdadeira depois que o botão de partida é solto.',
        whyItMatters: 'É um dos comandos mais importantes para entender partida de motores e retenção de estado.',
        practice: 'Simule uma partida com selo e observe quando a saída permanece ligada.',
        masteryCheck: 'Diga qual condição desliga o selo e por quê.',
        exampleProjectId: 'selo',
      },
      {
        id: 'interlock',
        moduleId: 'ladder-thinking',
        title: 'Intertravamento',
        shortTitle: 'Intertravamento',
        difficulty: 'intermediate',
        durationMinutes: 13,
        concept: 'Intertravamento impede que duas condições incompatíveis sejam acionadas ao mesmo tempo, como avanço e reversão de um motor.',
        whyItMatters: 'Em comandos reais, intertravamento protege equipamentos e operadores contra acionamentos conflitantes.',
        practice: 'Analise um comando de reversão e identifique o contato que bloqueia o contator oposto.',
        masteryCheck: 'Explique o risco de ligar dois contatores reversores simultaneamente.',
        exampleProjectId: 'reversao',
      },
    ],
  },
  {
    id: 'instructions',
    title: 'Instruções essenciais',
    description: 'Temporizadores, contadores, SET/RESET e bordas.',
    progress: 18,
    lessons: [
      {
        id: 'timers-ton-tof',
        moduleId: 'instructions',
        title: 'Temporizadores TON e TOF',
        shortTitle: 'Timers',
        difficulty: 'intermediate',
        durationMinutes: 15,
        concept: 'TON atrasa o acionamento após uma condição ficar verdadeira; TOF atrasa o desligamento após a condição deixar de ser verdadeira.',
        whyItMatters: 'Temporizadores são usados em partida, segurança, sequências, alarmes e automações de processo.',
        practice: 'Monte um semáforo simples usando temporizadores encadeados.',
        masteryCheck: 'Explique a diferença prática entre TON e TOF.',
        exampleProjectId: 'semaforo',
      },
      {
        id: 'counters-ctu-ctd',
        moduleId: 'instructions',
        title: 'Contadores CTU e CTD',
        shortTitle: 'Contadores',
        difficulty: 'intermediate',
        durationMinutes: 13,
        concept: 'CTU conta eventos para cima e CTD conta para baixo, normalmente a partir de pulsos ou transições de sinal.',
        whyItMatters: 'Contadores aparecem em esteiras, produção, ciclos, peças, alarmes e controle de lotes.',
        practice: 'Simule uma esteira contando peças que passam por um sensor.',
        masteryCheck: 'Explique por que um contador deve contar eventos e não apenas nível lógico constante.',
        exampleProjectId: 'esteira',
      },
      {
        id: 'set-reset-edge',
        moduleId: 'instructions',
        title: 'SET, RESET e bordas',
        shortTitle: 'SET/RESET',
        difficulty: 'advanced',
        durationMinutes: 16,
        concept: 'SET mantém uma saída ou memória ligada, RESET desliga, e instruções de borda detectam transições momentâneas.',
        whyItMatters: 'Essas instruções ajudam em sequências, memórias de processo e eventos que devem acontecer uma única vez por acionamento.',
        practice: 'Use uma borda positiva para incrementar um contador apenas uma vez por pulso.',
        masteryCheck: 'Explique quando usar selo e quando usar SET/RESET.',
      },
    ],
  },
  {
    id: 'applications',
    title: 'Aplicações reais',
    description: 'Projetos clássicos para prática e sala de aula.',
    progress: 8,
    lessons: [
      {
        id: 'motor-starting',
        moduleId: 'applications',
        title: 'Partida direta e selo de motor',
        shortTitle: 'Motor',
        difficulty: 'basic',
        durationMinutes: 16,
        concept: 'Um comando de motor usa entrada de partida, parada, proteção e saída para contator.',
        whyItMatters: 'É uma base usada em comandos elétricos, automação industrial e ensino de CLP.',
        practice: 'Abra o projeto de partida com selo e acompanhe entradas e saída no modo simulação.',
        masteryCheck: 'Mostre quais sinais impedem o motor de ligar.',
        exampleProjectId: 'selo',
      },
      {
        id: 'reservoir-control',
        moduleId: 'applications',
        title: 'Reservatório com sensores de nível',
        shortTitle: 'Reservatório',
        difficulty: 'intermediate',
        durationMinutes: 18,
        concept: 'Controle de reservatório usa sensores de nível para ligar/desligar bomba e evitar transbordamento ou funcionamento a seco.',
        whyItMatters: 'É uma aplicação didática e prática para entender automação de processos simples.',
        practice: 'Simule nível baixo, nível alto e falha de sensor.',
        masteryCheck: 'Explique como evitar que a bomba ligue sem água.',
        exampleProjectId: 'reservatorio',
      },
      {
        id: 'traffic-light',
        moduleId: 'applications',
        title: 'Semáforo sequencial',
        shortTitle: 'Semáforo',
        difficulty: 'intermediate',
        durationMinutes: 18,
        concept: 'Semáforos usam sequência de estados e temporizadores para controlar saídas em ordem definida.',
        whyItMatters: 'É excelente para ensinar sequenciamento, timers e leitura de estados.',
        practice: 'Monte uma sequência verde, amarelo e vermelho usando timers.',
        masteryCheck: 'Explique o que acontece se um timer não reiniciar corretamente.',
        exampleProjectId: 'semaforo',
      },
    ],
  },
  {
    id: 'diagnostics',
    title: 'Diagnóstico e troubleshooting',
    description: 'Scan, tags, forces e análise de falhas.',
    progress: 4,
    lessons: [
      {
        id: 'reading-tags',
        moduleId: 'diagnostics',
        title: 'Lendo tabela de tags',
        shortTitle: 'Tags',
        difficulty: 'basic',
        durationMinutes: 12,
        concept: 'A tabela de tags mostra nome, tipo, escopo, valor atual, descrição e estado forçado de cada sinal.',
        whyItMatters: 'Bons diagnósticos começam por saber quais sinais estão ativos, quais estão forçados e quais pertencem ao programa.',
        practice: 'Abra Tags + Diagnóstico e identifique entradas, saídas, memórias, timers e contadores.',
        masteryCheck: 'Explique a diferença entre valor real e valor forçado.',
      },
      {
        id: 'force-safety',
        moduleId: 'diagnostics',
        title: 'Force didático com segurança',
        shortTitle: 'Force',
        difficulty: 'intermediate',
        durationMinutes: 14,
        concept: 'Force altera temporariamente o valor lógico de um sinal para teste, mas em sistemas reais pode acionar máquinas.',
        whyItMatters: 'O aluno precisa aprender diagnóstico sem tratar Force como brincadeira ou botão comum.',
        practice: 'Force uma memória no simulador e observe como o diagnóstico destaca o estado.',
        masteryCheck: 'Liste dois cuidados antes de forçar uma saída em um CLP real.',
      },
      {
        id: 'scan-diagnostics',
        moduleId: 'diagnostics',
        title: 'Diagnóstico de scan e linha ativa',
        shortTitle: 'Scan',
        difficulty: 'intermediate',
        durationMinutes: 15,
        concept: 'O diagnóstico de scan ajuda a entender quais linhas foram verdadeiras e quais saídas mudaram em cada ciclo.',
        whyItMatters: 'Quando uma lógica não funciona, o técnico precisa enxergar o caminho lógico e não apenas trocar componentes.',
        practice: 'Execute um projeto e acompanhe linha ativa, saída ativa e último scan.',
        masteryCheck: 'Explique por que uma saída pode não ligar mesmo com uma entrada acionada.',
      },
    ],
  },
];

export function getAllClpLessons(): ClpLesson[] {
  return clpLearningModules.flatMap((module) => module.lessons);
}

export function getClpLessonById(id: string): ClpLesson | undefined {
  return getAllClpLessons().find((lesson) => lesson.id === id);
}
