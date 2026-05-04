import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/education/guidedPractice.ts');
let source = fs.readFileSync(filePath, 'utf8');
const original = source;

const oldReverseStar = "step('rsd-reverse-star', 'Comande reverso sem usar Stop', 'K2 reverso deve assumir sem K1, reiniciando em estrela.', boolValue(evaluation, 'I0.1') && !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2') && !boolValue(evaluation, 'Q0.3'))";
const newReverseStar = "step('rsd-reverse-star', 'Comande reverso sem usar Stop', 'K2 reverso deve assumir sem K1, reiniciando em estrela.', (boolValue(evaluation, 'I0.1') || boolValue(evaluation, 'M0.1') || boolValue(evaluation, 'Q0.1')) && !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && boolValue(evaluation, 'Q0.2') && !boolValue(evaluation, 'Q0.3'))";

const oldReverseDelta = "step('rsd-reverse-delta', 'Rode scans até triângulo em reverso', 'T2 deve finalizar e K4 triângulo deve ligar no reverso.', !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2') && boolValue(evaluation, 'Q0.3') && boolValue(evaluation, 'T2'))";
const newReverseDelta = "step('rsd-reverse-delta', 'Rode scans até triângulo em reverso', 'T2 deve finalizar e K4 triângulo deve ligar no reverso.', !boolValue(evaluation, 'Q0.0') && boolValue(evaluation, 'Q0.1') && !boolValue(evaluation, 'Q0.2') && boolValue(evaluation, 'T2') && (boolValue(evaluation, 'Q0.3') || boolValue(evaluation, 'M0.1')))";

if (!source.includes(oldReverseStar)) {
  throw new Error('Não encontrei a condição antiga rsd-reverse-star.');
}
if (!source.includes(oldReverseDelta)) {
  throw new Error('Não encontrei a condição antiga rsd-reverse-delta.');
}

source = source.replace(oldReverseStar, newReverseStar);
source = source.replace(oldReverseDelta, newReverseDelta);

if (source !== original) {
  fs.writeFileSync(filePath, source);
  console.log('Condições guiadas do reversing-star-delta ajustadas para validar estado de memória/direção, não apenas o pulso momentâneo do botão.');
} else {
  console.log('Nenhuma alteração necessária.');
}
