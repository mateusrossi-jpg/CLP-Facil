import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorProjectState } from '../engine/editorTypes';
import { createPlcProfileProjectView, PlcProfileId, plcProfiles } from '../plcProfiles/plcProfiles';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PlcProfilePanelProps = {
  editorProject: EditorProjectState;
  selectedProfile: PlcProfileId;
  onSelectProfile: (profile: PlcProfileId) => void;
};

function profileLegend(profileId: PlcProfileId): { title: string; items: { symbol: string; meaning: string }[] } {
  if (profileId === 'rockwell_like') {
    return {
      title: 'Legenda Rockwell-like',
      items: [
        { symbol: 'XIC', meaning: 'Examine If Closed: conduz quando a tag está ON.' },
        { symbol: 'XIO', meaning: 'Examine If Open: conduz quando a tag está OFF.' },
        { symbol: 'OTE', meaning: 'Energiza a saída enquanto a linha é verdadeira.' },
        { symbol: 'OTL / OTU', meaning: 'Trava e destrava uma saída/memória.' },
        { symbol: 'ONS / OSF', meaning: 'Pulso de borda de subida ou descida.' },
        { symbol: 'TON / CTU', meaning: 'Temporizador e contador crescente.' },
      ],
    };
  }

  if (profileId === 'iec_like') {
    return {
      title: 'Legenda IEC-like',
      items: [
        { symbol: 'Contato NA', meaning: 'Conduz quando a variável booleana está verdadeira.' },
        { symbol: 'Contato NF', meaning: 'Conduz quando a variável booleana está falsa.' },
        { symbol: 'Coil', meaning: 'Escreve a saída conforme o resultado da linha.' },
        { symbol: 'S / R', meaning: 'Set e Reset para retenção de estado.' },
        { symbol: 'P_TRIG / N_TRIG', meaning: 'Detector de borda positiva ou negativa.' },
        { symbol: 'TON / CTU', meaning: 'Blocos clássicos de tempo e contagem.' },
      ],
    };
  }

  if (profileId === 'commands_like') {
    return {
      title: 'Legenda Comandos elétricos',
      items: [
        { symbol: 'Contato NA', meaning: 'Representa botoeira/sensor normalmente aberto.' },
        { symbol: 'Contato NF', meaning: 'Representa stop, fim de curso ou proteção normalmente fechada.' },
        { symbol: 'Bobina/Contator', meaning: 'Aciona K, relé, motor ou lâmpada.' },
        { symbol: 'Retenção', meaning: 'Equivale ao selo ou memória de comando.' },
        { symbol: 'Desarme', meaning: 'Quebra retenção ou condição de segurança.' },
        { symbol: 'Relé tempo TON', meaning: 'Temporização para partir, atrasar ou sequenciar.' },
      ],
    };
  }

  return {
    title: 'Legenda Easy-CLP',
    items: [
      { symbol: 'NA', meaning: 'Contato normalmente aberto.' },
      { symbol: 'NF', meaning: 'Contato normalmente fechado.' },
      { symbol: 'Bobina', meaning: 'Saída ou memória acionada pela linha.' },
      { symbol: 'Set / Reset', meaning: 'Liga e desliga memória retentiva.' },
      { symbol: 'Borda + / -', meaning: 'Pulso momentâneo no evento de mudança.' },
      { symbol: 'TON / CTU', meaning: 'Tempo e contagem para sequências didáticas.' },
    ],
  };
}

export function PlcProfilePanel({ editorProject, selectedProfile, onSelectProfile }: PlcProfilePanelProps) {
  const profileView = createPlcProfileProjectView(editorProject, selectedProfile);
  const legend = profileLegend(selectedProfile);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Dialetos CLP</Text>
          <Text style={styles.title}>Visualizar lógica em perfis industriais</Text>
          <Text style={styles.subtitle}>Compare a mesma linha Ladder como Easy-CLP, Rockwell-like, IEC/Siemens-like ou comandos elétricos.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{profileView.profile.shortName}</Text>
        </View>
      </View>

      <View style={styles.profileRow}>
        {plcProfiles.map((profile) => {
          const selected = selectedProfile === profile.id;
          return (
            <Pressable key={profile.id} onPress={() => onSelectProfile(profile.id)} style={[styles.profileChip, selected && styles.profileChipActive]}>
              <Text style={[styles.profileChipText, selected && styles.profileChipTextActive]}>{profile.shortName}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{profileView.profile.name}</Text>
        <Text style={styles.infoText}>{profileView.profile.description}</Text>
        <Text style={styles.disclaimer}>{profileView.profile.disclaimer}</Text>
      </View>

      <View style={styles.legendBox}>
        <Text style={styles.legendTitle}>{legend.title}</Text>
        <View style={styles.legendGrid}>
          {legend.items.map((item) => (
            <View key={`${selectedProfile}-${item.symbol}`} style={styles.legendItem}>
              <Text style={styles.legendSymbol}>{item.symbol}</Text>
              <Text style={styles.legendMeaning}>{item.meaning}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rungList}>
        {profileView.rungs.map((rung, index) => (
          <View key={rung.rungId} style={styles.rungCard}>
            <View style={styles.rungHeader}>
              <Text style={styles.rungIndex}>Linha {index + 1}</Text>
              <Text style={styles.rungTitle} numberOfLines={1}>{rung.label.replace(/^Linha \d+\s+[—-]\s+/, '')}</Text>
            </View>
            <Text style={styles.logicLine}>{rung.textLine}</Text>

            <View style={styles.blockGrid}>
              {[...rung.series, ...rung.parallelBranches.flat(), ...(rung.output ? [rung.output] : [])].map((block) => (
                <View key={block.blockId} style={styles.blockCard}>
                  <Text style={styles.blockInstruction}>{block.instruction}</Text>
                  <Text style={styles.blockOperand} numberOfLines={1}>{block.operand}</Text>
                  <Text style={styles.blockDescription} numberOfLines={2}>{block.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  badge: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.cyanSoft,
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  profileChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  profileChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  profileChipTextActive: {
    color: colors.amber,
  },
  infoBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  disclaimer: {
    color: colors.amber,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  legendBox: {
    borderColor: colors.cyan,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.cyanSoft,
    gap: spacing.sm,
  },
  legendTitle: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexGrow: 1,
    flexBasis: 150,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  legendSymbol: {
    color: colors.green,
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
  },
  legendMeaning: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  rungList: {
    gap: spacing.md,
  },
  rungCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  rungHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rungIndex: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rungTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  logicLine: {
    color: colors.text,
    backgroundColor: colors.black,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 17,
  },
  blockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  blockCard: {
    flexGrow: 1,
    flexBasis: 120,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  blockInstruction: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '900',
  },
  blockOperand: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  blockDescription: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
});
