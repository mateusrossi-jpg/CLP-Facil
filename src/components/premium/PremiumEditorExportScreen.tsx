import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumBadge, PremiumHeader, PremiumScreen, PremiumSection } from './index';

const ladderBlocks = [
  { label: 'NA', description: 'Contato normalmente aberto para Start, sensor ou selo.' },
  { label: 'NF', description: 'Contato normalmente fechado para Stop e intertravamento.' },
  { label: 'COIL', description: 'Bobina de saida Q/O ou memoria M.' },
  { label: 'TON', description: 'Temporizador de retardo na energizacao.' },
  { label: 'CTU', description: 'Contador crescente por pulso.' },
];

const codePreview = `// Arduino - previa didatica
const int START = 2;
const int STOP = 3;
const int K1 = 8;

void loop() {
  bool permissivo = digitalRead(STOP);
  bool partida = digitalRead(START);
  digitalWrite(K1, permissivo && partida);
}`;

export const PremiumEditorExportScreen = memo(function PremiumEditorExportScreen() {
  return (
    <PremiumScreen>
      <PremiumHeader
        eyebrow="Editor e exportacao"
        title="Ladder mobile + codigo"
        subtitle="Monte rungs compactos, revise comentarios e gere uma previa didatica para Arduino, ESP32 ou ESPHome."
        right={<PremiumBadge label="Beta" tone="amber" />}
      />

      <PremiumSection title="Ferramentas Ladder" subtitle="Blocos essenciais para pratica em curso tecnico" tone="cyan">
        <View style={styles.toolGrid}>
          {ladderBlocks.map((block) => (
            <View key={block.label} style={styles.toolCard}>
              <Text style={styles.toolLabel}>{block.label}</Text>
              <Text style={styles.toolDescription}>{block.description}</Text>
            </View>
          ))}
        </View>
      </PremiumSection>

      <PremiumSection title="Rung comentado" subtitle="Exemplo compacto para smartphone" tone="green">
        <View style={styles.rungCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.rungText}>|--[/ STOP]--[ START ]--+--( K1 )--|   // Partida segura com selo</Text>
          </ScrollView>
          <Text style={styles.commentText}>Comentario: Stop deve interromper o selo antes de liberar a saida do contator.</Text>
        </View>
      </PremiumSection>

      <PremiumSection title="Previa de codigo" subtitle="Fundo escuro e leitura clara para exportacao didatica" tone="purple">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeBox}>
          <Text style={styles.codeText}>{codePreview}</Text>
        </ScrollView>
      </PremiumSection>
    </PremiumScreen>
  );
});

const styles = StyleSheet.create({
  toolGrid: {
    gap: spacing.sm,
  },
  toolCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  toolLabel: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: '900',
  },
  toolDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  rungCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  rungText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  commentText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  codeBox: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.codeBackground,
  },
  codeText: {
    color: colors.codeText,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    padding: spacing.md,
  },
});
