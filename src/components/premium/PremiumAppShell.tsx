import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation } from '../BottomNavigation';
import type { BottomNavKey } from '../navigationTypes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { PremiumRouteContent } from './PremiumRouteContent';

type PremiumAppShellProps = {
  initialRoute?: BottomNavKey;
};

export const PremiumAppShell = memo(function PremiumAppShell({ initialRoute = 'home' }: PremiumAppShellProps) {
  const [activeRoute, setActiveRoute] = useState<BottomNavKey>(initialRoute);

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        <PremiumRouteContent active={activeRoute} />
      </View>
      <BottomNavigation active={activeRoute} onChange={setActiveRoute} renderContent={false} compact />
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
