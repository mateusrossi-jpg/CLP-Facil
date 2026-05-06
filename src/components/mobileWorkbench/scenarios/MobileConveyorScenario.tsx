import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type Props = { tags: Record<string, boolean> };

export const MobileConveyorScenario = memo(function MobileConveyorScenario({ tags }: Props) {
  return <View style={styles.scene}><Text style={styles.title}>Esteira</Text><View style={styles.belt}><View style={[styles.box, tags['I0.2'] && styles.boxDetected]} /></View><View style={[styles.motor, tags['Q0.0'] && styles.motorOn]} /><View style={styles.tower}><View style={[styles.light, tags['Q0.1'] && styles.greenOn]} /><View style={[styles.light, tags['Q0.2'] && styles.redOn]} /></View></View>;
});

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  belt: { height: 44, borderRadius: 8, backgroundColor: colors.slate, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: 'center', paddingHorizontal: spacing.md },
  box: { width: 24, height: 20, backgroundColor: colors.amberSoft, borderColor: colors.amber, borderWidth: 1, borderRadius: 4 },
  boxDetected: { backgroundColor: colors.amber },
  motor: { marginTop: spacing.sm, width: 42, height: 24, borderRadius: 12, backgroundColor: colors.inactive },
  motorOn: { backgroundColor: colors.green },
  tower: { position: 'absolute', right: spacing.md, top: spacing.md, gap: spacing.xs },
  light: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.inactive },
  greenOn: { backgroundColor: colors.green },
  redOn: { backgroundColor: colors.red },
});
