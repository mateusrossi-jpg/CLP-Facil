export type VariableType = 'input' | 'output' | 'memory' | 'actuator';
export type ContactType = 'NO' | 'NC';

export type PlcVariable = {
  id: string;
  label: string;
  type: VariableType;
  description?: string;
  momentary?: boolean;
  defaultValue?: boolean;
};

export type LadderContact = {
  id: string;
  variableId: string;
  type: ContactType;
  label?: string;
};

export type LadderBranch = {
  id: string;
  contacts: LadderContact[];
};

export type LadderRung = {
  id: string;
  label: string;
  seriesContacts: LadderContact[];
  parallelBranches: LadderBranch[];
  coilVariableId: string;
};

export type LadderProject = {
  id: string;
  name: string;
  description: string;
  variables: PlcVariable[];
  rungs: LadderRung[];
  actuatorLinks: Record<string, string>;
};

export type PlcState = Record<string, boolean | number>;

export type EvaluationResult = {
  state: PlcState;
  energizedRungs: Record<string, boolean>;
  explanation: string;
};
