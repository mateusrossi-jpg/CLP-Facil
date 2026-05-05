import { EditorProjectState } from '../engine/editorTypes';
import { PlcState } from '../engine/projectTypes';

export type PlcMissionValidation = {
  type: 'output_on_when_input_on' | 'output_off_when_input_off' | 'stop_blocks_output' | 'scan_concept' | 'custom';
  input?: string;
  output?: string;
  stopInput?: string;
  expected?: boolean | number;
  feedback: string;
};

export type PlcMission = {
  id: string;
  title: string;
  story: string;
  objective: string;
  availableComponents: string[];
  initialProject?: EditorProjectState;
  validation: PlcMissionValidation[];
  finalExplanation: string;
};

export type PlcMissionTrack = {
  id: string;
  title: string;
  description: string;
  missions: PlcMission[];
};

export type PlcMissionAttempt = {
  missionId: string;
  state: PlcState;
  passed: boolean;
  feedback: string;
};
