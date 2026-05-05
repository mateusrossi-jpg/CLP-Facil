import { applyPlcForces, clearPlcForce, upsertPlcForce } from './plcForceTable';

export type PlcForceTableRegressionResult = {
  name: string;
  passed: boolean;
  details?: string;
};

function assertResult(name: string, passed: boolean, details?: string): PlcForceTableRegressionResult {
  return { name, passed, details: passed ? undefined : details };
}

export function runPlcForceTableRegressionSuite(): PlcForceTableRegressionResult[] {
  const inputForce = applyPlcForces({ 'I0.0': false, 'Q0.0': false, 'M0.0': false }, [
    { address: 'I0.0', mode: 'force_on', enabled: true },
  ]);

  const memoryForce = applyPlcForces({ 'M0.0': true }, [
    { address: 'M0.0', mode: 'force_off', enabled: true },
  ]);

  const outputBlocked = applyPlcForces({ 'Q0.0': false }, [
    { address: 'Q0.0', mode: 'force_on', enabled: true },
  ]);

  const numericBlocked = applyPlcForces({ 'N7:0': 12 }, [
    { address: 'N7:0', mode: 'force_on', enabled: true },
  ]);

  const updated = upsertPlcForce([
    { address: 'I0.0', mode: 'force_on', enabled: true },
  ], { address: 'i0.0', mode: 'force_off', enabled: true });
  const cleared = clearPlcForce(updated, 'I0.0');

  return [
    assertResult(
      'force aplica entrada como ON',
      inputForce.state['I0.0'] === true && inputForce.appliedForces.length === 1 && inputForce.blockedForces.length === 0,
      JSON.stringify(inputForce),
    ),
    assertResult(
      'force aplica memoria como OFF',
      memoryForce.state['M0.0'] === false && memoryForce.appliedForces.length === 1,
      JSON.stringify(memoryForce),
    ),
    assertResult(
      'force bloqueia saida por padrao',
      outputBlocked.state['Q0.0'] === false && outputBlocked.appliedForces.length === 0 && outputBlocked.blockedForces.length === 1,
      JSON.stringify(outputBlocked),
    ),
    assertResult(
      'force bloqueia registrador numerico',
      numericBlocked.state['N7:0'] === 12 && numericBlocked.blockedForces.length === 1,
      JSON.stringify(numericBlocked),
    ),
    assertResult(
      'force upsert substitui e clear remove',
      updated.length === 1 && updated[0].address === 'I0.0' && updated[0].mode === 'force_off' && cleared.length === 0,
      JSON.stringify({ updated, cleared }),
    ),
  ];
}
