import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type MobileAdvancedDetailsProps = {
  diagnosticsCount: number;
};

export const MobileAdvancedDetails = memo(function MobileAdvancedDetails({ diagnosticsCount }: MobileAdvancedDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen((current) => !current)} style={styles.row}>
        <Text style={styles.title}>Avançado {open ? '▲' : '▼'}</Text>
        <Text style={styles.badge}>{diagnosticsCount} alertas</Text>
      </Pressable>
      {open ? <Text style={styles.text}>Abra as análises avançadas para CPU, trace, força e diagnóstico sem ocupar a área principal.</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, padding: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontWeight: '800' },
  badge: { color: colors.textMuted, fontSize: 12 },
  text: { color: colors.textMuted, fontSize: 12 },
});
