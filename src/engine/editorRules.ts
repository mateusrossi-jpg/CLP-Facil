import { SimulatorComponent } from '../data/componentLibrary';
import { EditorInsertionZone } from './editorTypes';

function isCoilComponent(component: SimulatorComponent): boolean {
  return (
    component.id.includes('coil') ||
    component.id.includes('contactor') ||
    component.id.includes('motor') ||
    component.id.includes('light') ||
    component.id.includes('memory')
  );
}

function isContactComponent(component: SimulatorComponent): boolean {
  return (
    component.category === 'input' ||
    component.id.includes('contact') ||
    component.id.includes('memory')
  );
}

export function canInsertComponentInZone(component: SimulatorComponent, zone: EditorInsertionZone): boolean {
  if (zone === 'coil') {
    return isCoilComponent(component);
  }

  if (zone === 'series' || zone === 'parallel') {
    return isContactComponent(component);
  }

  return false;
}

export function explainInsertionRule(component: SimulatorComponent, zone: EditorInsertionZone): string {
  if (canInsertComponentInZone(component, zone)) {
    return 'Componente compatível com a zona selecionada.';
  }

  if (zone === 'coil') {
    return `${component.name} não deve ser inserido na zona Bobina. Escolha bobina, contator, motor, lâmpada ou memória.`;
  }

  return `${component.name} não deve ser inserido em Série/Paralelo. Escolha contatos, botões, sensores ou memórias como condição lógica.`;
}
