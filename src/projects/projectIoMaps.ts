import type { TrainingProject } from './projectCatalog';

export type ProjectIoKind = 'input' | 'output' | 'memory' | 'timer' | 'counter';

export type ProjectIoPoint = {
  id: string;
  projectId: TrainingProject['id'];
  kind: ProjectIoKind;
  tag: string;
  label: string;
  description: string;
  normallyClosed?: boolean;
  safetyCritical?: boolean;
};

export const projectIoPoints: ProjectIoPoint[] = [
  { id: 'pd-i-start', projectId: 'partida-direta', kind: 'input', tag: 'I0.0', label: 'Partida', description: 'Botão de partida momentâneo do motor.' },
  { id: 'pd-i-stop', projectId: 'partida-direta', kind: 'input', tag: 'I0.1', label: 'Parada', description: 'Botão de parada normalmente fechado.', normallyClosed: true, safetyCritical: true },
  { id: 'pd-q-km1', projectId: 'partida-direta', kind: 'output', tag: 'Q0.0', label: 'KM1', description: 'Contator principal do motor.', safetyCritical: true },

  { id: 'selo-i-start', projectId: 'selo', kind: 'input', tag: 'I0.0', label: 'Partida', description: 'Comando momentâneo de partida.' },
  { id: 'selo-i-stop', projectId: 'selo', kind: 'input', tag: 'I0.1', label: 'Parada', description: 'Comando de parada NF.', normallyClosed: true, safetyCritical: true },
  { id: 'selo-q-km1', projectId: 'selo', kind: 'output', tag: 'Q0.0', label: 'KM1', description: 'Saída do contator sustentada pelo selo.', safetyCritical: true },
  { id: 'selo-m-running', projectId: 'selo', kind: 'memory', tag: 'M0.0', label: 'Motor ligado', description: 'Memória didática de motor em operação.' },

  { id: 'rev-i-forward', projectId: 'reversao', kind: 'input', tag: 'I0.0', label: 'Avanço', description: 'Comando de giro no sentido avanço.' },
  { id: 'rev-i-reverse', projectId: 'reversao', kind: 'input', tag: 'I0.1', label: 'Reverso', description: 'Comando de giro no sentido reverso.' },
  { id: 'rev-i-stop', projectId: 'reversao', kind: 'input', tag: 'I0.2', label: 'Parada', description: 'Parada geral do comando.', normallyClosed: true, safetyCritical: true },
  { id: 'rev-q-k1', projectId: 'reversao', kind: 'output', tag: 'Q0.0', label: 'K1 avanço', description: 'Contator de avanço.', safetyCritical: true },
  { id: 'rev-q-k2', projectId: 'reversao', kind: 'output', tag: 'Q0.1', label: 'K2 reverso', description: 'Contator de reversão.', safetyCritical: true },

  { id: 'yt-i-start', projectId: 'estrela-triangulo', kind: 'input', tag: 'I0.0', label: 'Partida', description: 'Comando de partida estrela-triângulo.' },
  { id: 'yt-i-stop', projectId: 'estrela-triangulo', kind: 'input', tag: 'I0.1', label: 'Parada', description: 'Parada do circuito de partida.', normallyClosed: true, safetyCritical: true },
  { id: 'yt-q-main', projectId: 'estrela-triangulo', kind: 'output', tag: 'Q0.0', label: 'K principal', description: 'Contator principal do motor.', safetyCritical: true },
  { id: 'yt-q-star', projectId: 'estrela-triangulo', kind: 'output', tag: 'Q0.1', label: 'K estrela', description: 'Contator de ligação estrela.', safetyCritical: true },
  { id: 'yt-q-delta', projectId: 'estrela-triangulo', kind: 'output', tag: 'Q0.2', label: 'K triângulo', description: 'Contator de ligação triângulo.', safetyCritical: true },
  { id: 'yt-t-transition', projectId: 'estrela-triangulo', kind: 'timer', tag: 'T1', label: 'Tempo estrela', description: 'Tempo de permanência na etapa estrela.' },
  { id: 'yt-t-deadtime', projectId: 'estrela-triangulo', kind: 'timer', tag: 'T2', label: 'Tempo morto', description: 'Intervalo entre estrela e triângulo.' },

  { id: 'sem-i-run', projectId: 'semaforo', kind: 'input', tag: 'I0.0', label: 'RUN', description: 'Habilita a sequência do semáforo.' },
  { id: 'sem-q-green', projectId: 'semaforo', kind: 'output', tag: 'Q0.0', label: 'Verde', description: 'Lâmpada verde.' },
  { id: 'sem-q-yellow', projectId: 'semaforo', kind: 'output', tag: 'Q0.1', label: 'Amarelo', description: 'Lâmpada amarela.' },
  { id: 'sem-q-red', projectId: 'semaforo', kind: 'output', tag: 'Q0.2', label: 'Vermelho', description: 'Lâmpada vermelha.' },
  { id: 'sem-t-green', projectId: 'semaforo', kind: 'timer', tag: 'T1', label: 'Tempo verde', description: 'Duração da etapa verde.' },
  { id: 'sem-t-yellow', projectId: 'semaforo', kind: 'timer', tag: 'T2', label: 'Tempo amarelo', description: 'Duração da etapa amarela.' },
  { id: 'sem-t-red', projectId: 'semaforo', kind: 'timer', tag: 'T3', label: 'Tempo vermelho', description: 'Duração da etapa vermelha.' },

  { id: 'pump-i-low', projectId: 'bomba-alternada', kind: 'input', tag: 'I0.0', label: 'Nível baixo', description: 'Solicita enchimento do reservatório.' },
  { id: 'pump-i-high', projectId: 'bomba-alternada', kind: 'input', tag: 'I0.1', label: 'Nível alto', description: 'Encerra enchimento.' },
  { id: 'pump-i-fault-a', projectId: 'bomba-alternada', kind: 'input', tag: 'I0.2', label: 'Falha bomba A', description: 'Falha/proteção da bomba A.', safetyCritical: true },
  { id: 'pump-i-ok', projectId: 'bomba-alternada', kind: 'input', tag: 'I0.3', label: 'Proteção OK', description: 'Permissivo geral de proteção.', safetyCritical: true },
  { id: 'pump-q-a', projectId: 'bomba-alternada', kind: 'output', tag: 'Q0.0', label: 'Bomba A', description: 'Acionamento da bomba A.', safetyCritical: true },
  { id: 'pump-q-b', projectId: 'bomba-alternada', kind: 'output', tag: 'Q0.1', label: 'Bomba B', description: 'Acionamento da bomba B.', safetyCritical: true },
  { id: 'pump-c-alt', projectId: 'bomba-alternada', kind: 'counter', tag: 'C0', label: 'Alternância', description: 'Contador/memória de alternância entre bombas.' },

  { id: 'conv-i-start', projectId: 'esteira', kind: 'input', tag: 'I0.0', label: 'Start', description: 'Liga a esteira.' },
  { id: 'conv-i-stop', projectId: 'esteira', kind: 'input', tag: 'I0.1', label: 'Stop', description: 'Desliga a esteira.', normallyClosed: true, safetyCritical: true },
  { id: 'conv-i-sensor', projectId: 'esteira', kind: 'input', tag: 'I0.2', label: 'Sensor peça', description: 'Pulso de detecção de peça.' },
  { id: 'conv-q-motor', projectId: 'esteira', kind: 'output', tag: 'Q0.0', label: 'Motor esteira', description: 'Acionamento do motor da esteira.', safetyCritical: true },
  { id: 'conv-t-delay', projectId: 'esteira', kind: 'timer', tag: 'T1', label: 'Atraso parada', description: 'Tempo auxiliar de parada.' },
  { id: 'conv-c-batch', projectId: 'esteira', kind: 'counter', tag: 'C0', label: 'Contador lote', description: 'Conta peças do lote.' },

  { id: 'gate-i-open', projectId: 'portao-automatico', kind: 'input', tag: 'I0.0', label: 'Abrir', description: 'Comando de abertura.' },
  { id: 'gate-i-close', projectId: 'portao-automatico', kind: 'input', tag: 'I0.1', label: 'Fechar', description: 'Comando de fechamento.' },
  { id: 'gate-i-opened', projectId: 'portao-automatico', kind: 'input', tag: 'I0.2', label: 'Fim aberto', description: 'Fim de curso de portão aberto.', safetyCritical: true },
  { id: 'gate-i-closed', projectId: 'portao-automatico', kind: 'input', tag: 'I0.3', label: 'Fim fechado', description: 'Fim de curso de portão fechado.', safetyCritical: true },
  { id: 'gate-q-open', projectId: 'portao-automatico', kind: 'output', tag: 'Q0.0', label: 'Motor abrir', description: 'Motor no sentido de abertura.', safetyCritical: true },
  { id: 'gate-q-close', projectId: 'portao-automatico', kind: 'output', tag: 'Q0.1', label: 'Motor fechar', description: 'Motor no sentido de fechamento.', safetyCritical: true },

  { id: 'tank-i-low', projectId: 'reservatorio', kind: 'input', tag: 'I0.0', label: 'Nível baixo', description: 'Sensor inferior solicita enchimento.' },
  { id: 'tank-i-high', projectId: 'reservatorio', kind: 'input', tag: 'I0.1', label: 'Nível alto', description: 'Sensor superior indica reservatório cheio.' },
  { id: 'tank-i-dry-ok', projectId: 'reservatorio', kind: 'input', tag: 'I0.2', label: 'Proteção seco OK', description: 'Permissivo contra funcionamento a seco.', safetyCritical: true },
  { id: 'tank-q-pump', projectId: 'reservatorio', kind: 'output', tag: 'Q0.0', label: 'Bomba', description: 'Bomba de enchimento.', safetyCritical: true },
  { id: 'tank-t-protection', projectId: 'reservatorio', kind: 'timer', tag: 'T1', label: 'Tempo proteção', description: 'Tempo de proteção/diagnóstico do enchimento.' },
];

export function getIoPointsForProject(projectId: TrainingProject['id']): ProjectIoPoint[] {
  return projectIoPoints.filter((point) => point.projectId === projectId);
}

export function getIoPointsByKind(projectId: TrainingProject['id'], kind: ProjectIoKind): ProjectIoPoint[] {
  return getIoPointsForProject(projectId).filter((point) => point.kind === kind);
}

export function getSafetyCriticalIoPoints(projectId: TrainingProject['id']): ProjectIoPoint[] {
  return getIoPointsForProject(projectId).filter((point) => point.safetyCritical);
}

export function getProjectIoKindLabel(kind: ProjectIoKind): string {
  if (kind === 'input') return 'Entrada';
  if (kind === 'output') return 'Saída';
  if (kind === 'memory') return 'Memória';
  if (kind === 'timer') return 'Timer';
  return 'Contador';
}
