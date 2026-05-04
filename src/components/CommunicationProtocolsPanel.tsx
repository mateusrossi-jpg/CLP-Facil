import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { communicationProtocols, difficultyLabel, maturityLabel } from '../communication/protocolCatalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

function maturityTone(maturity: string) {
  if (maturity === 'ready_for_planning') return styles.readyBadge;
  if (maturity === 'future') return styles.futureBadge;
  return styles.researchBadge;
}

function maturityTextTone(maturity: string) {
  if (maturity === 'ready_for_planning') return styles.readyBadgeText;
  if (maturity === 'future') return styles.futureBadgeText;
  return styles.researchBadgeText;
}

export const CommunicationProtocolsPanel = memo(function CommunicationProtocolsPanel() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Protocolos</Text>
          <Text style={styles.title}>Comunicação industrial e microcontroladores</Text>
          <Text style={styles.subtitle}>Mapa de caminhos para evoluir do simulador para bancada, IoT, ESPHome, Modbus e protocolos industriais.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{communicationProtocols.length} rotas</Text>
        </View>
      </View>

      <View style={styles.priorityBox}>
        <Text style={styles.priorityTitle}>Prioridade prática</Text>
        <Text style={styles.priorityText}>Começar por exportação Arduino/ESP32, ESPHome YAML, Modbus e MQTT. EtherNet/IP, S7 e OPC UA ficam como referência e pesquisa avançada.</Text>
      </View>

      <View style={styles.protocolList}>
        {communicationProtocols.map((protocol) => (
          <View key={protocol.id} style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <View style={styles.protocolTitleBox}>
                <Text style={styles.protocolName}>{protocol.name}</Text>
                <Text style={styles.protocolLayer}>{protocol.layer.replace('_', ' ')}</Text>
              </View>
              <View style={[styles.statusBadge, maturityTone(protocol.maturity)]}>
                <Text style={[styles.statusBadgeText, maturityTextTone(protocol.maturity)]}>{maturityLabel(protocol.maturity)}</Text>
              </View>
            </View>

            <Text style={styles.summary}>{protocol.summary}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaChip}>Dificuldade: {difficultyLabel(protocol.difficulty)}</Text>
              <Text style={styles.metaChip}>{protocol.shortName}</Text>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Uso no Easy-CLP</Text>
              <Text style={styles.sectionText}>{protocol.easyClpUse}</Text>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Primeira implementação</Text>
              <Text style={styles.sectionText}>{protocol.firstImplementation}</Text>
            </View>

            <View style={styles.targetsRow}>
              {protocol.supportedTargets.map((target) => (
                <Text key={target} style={styles.targetChip}>{target}</Text>
              ))}
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Cuidados</Text>
              {protocol.warnings.map((warning) => <Text key={warning} style={styles.warningText}>• {warning}</Text>)}
            </View>

            <View style={styles.roadmapBox}>
              <Text style={styles.roadmapTitle}>Roadmap</Text>
              {protocol.roadmap.map((step) => <Text key={step} style={styles.roadmapText}>• {step}</Text>)}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

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
    borderColor: colors.green,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.greenSoft,
  },
  badgeText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  priorityBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.goldSoft,
  },
  priorityTitle: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  priorityText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  protocolList: {
    gap: spacing.md,
  },
  protocolCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  protocolTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  protocolName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  protocolLayer: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  readyBadge: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  futureBadge: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyanSoft,
  },
  researchBadge: {
    borderColor: colors.amber,
    backgroundColor: colors.goldSoft,
  },
  readyBadgeText: {
    color: colors.green,
  },
  futureBadgeText: {
    color: colors.cyan,
  },
  researchBadgeText: {
    color: colors.amber,
  },
  summary: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    color: colors.textMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: colors.surface,
  },
  sectionBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  sectionText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  targetChip: {
    color: colors.text,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: colors.black,
  },
  warningBox: {
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.goldSoft,
  },
  warningTitle: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  warningText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  roadmapBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.black,
  },
  roadmapTitle: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
  },
  roadmapText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
