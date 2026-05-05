import type { ClpLesson } from './clpLessonCatalog';

export type QuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
};

export type ClpLessonQuiz = {
  lessonId: ClpLesson['id'];
  question: string;
  options: QuizOption[];
};

export const clpLessonQuizzes: ClpLessonQuiz[] = [
  {
    lessonId: 'before-clp',
    question: 'Por que entender comandos por relés ajuda no aprendizado de Ladder?',
    options: [
      {
        id: 'a',
        label: 'Porque o Ladder nasceu visualmente parecido com diagramas elétricos de comando.',
        isCorrect: true,
        explanation: 'Correto. A linguagem Ladder foi criada para ser familiar a técnicos acostumados com contatos, bobinas e lógica cabeada.',
      },
      {
        id: 'b',
        label: 'Porque CLPs só funcionam quando há relés físicos em todos os rungs.',
        isCorrect: false,
        explanation: 'Não. O CLP simula a lógica no programa; relés físicos podem existir no painel, mas não em cada rung interno.',
      },
      {
        id: 'c',
        label: 'Porque temporizadores eletromecânicos são obrigatórios em todo CLP moderno.',
        isCorrect: false,
        explanation: 'Não. CLPs modernos possuem temporizadores por software, mesmo que temporizadores externos ainda possam existir em painéis.',
      },
    ],
  },
  {
    lessonId: 'scan-cycle',
    question: 'Qual é a sequência básica mais comum do ciclo de scan de um CLP?',
    options: [
      {
        id: 'a',
        label: 'Atualizar saídas, executar programa e depois ler entradas.',
        isCorrect: false,
        explanation: 'Essa ordem não representa a sequência didática mais comum usada para explicar o scan.',
      },
      {
        id: 'b',
        label: 'Ler entradas, executar o programa e atualizar saídas.',
        isCorrect: true,
        explanation: 'Correto. Essa é a forma didática clássica de entender o scan: entrada, lógica e saída.',
      },
      {
        id: 'c',
        label: 'Executar somente as linhas que mudaram desde o último scan.',
        isCorrect: false,
        explanation: 'Não. Em geral, o CLP varre o programa ciclicamente; otimizações podem existir, mas não são a base didática inicial.',
      },
    ],
  },
  {
    lessonId: 'no-nc-coil',
    question: 'Por que o botão de parada costuma aparecer como contato NF na lógica Ladder?',
    options: [
      {
        id: 'a',
        label: 'Porque a condição normal permite a passagem lógica e a parada abre o caminho.',
        isCorrect: true,
        explanation: 'Correto. Isso representa o comportamento seguro e comum de comandos com botão de parada normalmente fechado.',
      },
      {
        id: 'b',
        label: 'Porque contatos NF sempre ligam a saída, independentemente das outras condições.',
        isCorrect: false,
        explanation: 'Não. O contato NF apenas inverte a condição lógica daquela entrada; ele ainda depende do restante da linha.',
      },
      {
        id: 'c',
        label: 'Porque botões de parada não podem ser usados como entradas de CLP.',
        isCorrect: false,
        explanation: 'Não. Botões de parada podem ser entradas de CLP, mas segurança real pode exigir circuitos dedicados dependendo da aplicação.',
      },
    ],
  },
  {
    lessonId: 'seal-in-circuit',
    question: 'O que mantém a saída ligada em um circuito de selo depois que o botão de partida é solto?',
    options: [
      {
        id: 'a',
        label: 'Um contato auxiliar da própria saída em paralelo com a partida.',
        isCorrect: true,
        explanation: 'Correto. O contato da própria saída mantém a linha verdadeira enquanto a parada não abrir o circuito.',
      },
      {
        id: 'b',
        label: 'Um timer obrigatório em série com a bobina.',
        isCorrect: false,
        explanation: 'Não. O selo básico não precisa de timer; ele usa realimentação lógica da própria saída.',
      },
      {
        id: 'c',
        label: 'A memória física do botão de partida.',
        isCorrect: false,
        explanation: 'Não. O botão é momentâneo; quem mantém o estado é a lógica de selo no circuito/programa.',
      },
    ],
  },
  {
    lessonId: 'interlock',
    question: 'Qual é a função principal do intertravamento em uma reversão de motor?',
    options: [
      {
        id: 'a',
        label: 'Permitir que avanço e reversão liguem juntos para aumentar torque.',
        isCorrect: false,
        explanation: 'Errado e perigoso. Ligar contatores opostos simultaneamente pode causar curto e dano ao equipamento.',
      },
      {
        id: 'b',
        label: 'Impedir acionamentos conflitantes entre contatores opostos.',
        isCorrect: true,
        explanation: 'Correto. O intertravamento bloqueia comandos incompatíveis, como avanço e reversão ao mesmo tempo.',
      },
      {
        id: 'c',
        label: 'Substituir todos os dispositivos de proteção do painel.',
        isCorrect: false,
        explanation: 'Não. Intertravamento é parte da lógica; proteções elétricas e de segurança continuam necessárias.',
      },
    ],
  },
  {
    lessonId: 'timers-ton-tof',
    question: 'Em termos práticos, o que faz um temporizador TON?',
    options: [
      {
        id: 'a',
        label: 'Atrasa o acionamento após a condição ficar verdadeira.',
        isCorrect: true,
        explanation: 'Correto. O TON conta enquanto a entrada está verdadeira e aciona após o tempo ajustado.',
      },
      {
        id: 'b',
        label: 'Atrasa o desligamento após a condição ficar falsa.',
        isCorrect: false,
        explanation: 'Isso descreve melhor um TOF, não um TON.',
      },
      {
        id: 'c',
        label: 'Conta peças detectadas por sensor.',
        isCorrect: false,
        explanation: 'Contagem de peças é função típica de contador, como CTU.',
      },
    ],
  },
  {
    lessonId: 'force-safety',
    question: 'Qual cuidado é essencial ao usar Force em um CLP real?',
    options: [
      {
        id: 'a',
        label: 'Tratar Force como ferramenta de diagnóstico com risco real de acionar máquinas.',
        isCorrect: true,
        explanation: 'Correto. Force pode alterar estados de entradas/saídas e causar movimento ou energização inesperada.',
      },
      {
        id: 'b',
        label: 'Usar Force sempre que quiser acelerar a produção.',
        isCorrect: false,
        explanation: 'Não. Force não é recurso operacional de produção; é uma ferramenta de diagnóstico e teste controlado.',
      },
      {
        id: 'c',
        label: 'Forçar saídas sem avisar ninguém, pois é apenas software.',
        isCorrect: false,
        explanation: 'Errado. Mesmo sendo software, pode acionar hardware físico e gerar risco ao operador.',
      },
    ],
  },
];

export function getQuizForLesson(lessonId: ClpLesson['id']): ClpLessonQuiz | undefined {
  return clpLessonQuizzes.find((quiz) => quiz.lessonId === lessonId);
}
