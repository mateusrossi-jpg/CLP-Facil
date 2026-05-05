import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ProjectNavigationIntent } from '../../projects/projectNavigationIntent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { BottomNavigation } from '../BottomNavigation';
import type { BottomNavKey } from '../navigationTypes';
import { PremiumRouteContent } from './PremiumRouteContent';

type PremiumAppShellProps = {
  initialRoute?: BottomNavKey;
};

export const PremiumAppShell = memo(function PremiumAppShell({ initialRoute = 'home' }: PremiumAppShellProps) {
  const [activeRoute, setActiveRoute] = useState<BottomNavKey>(initialRoute);
  const [projectIntent, setProjectIntent] = useState<ProjectNavigationIntent | undefined>(undefined);

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        <PremiumRouteContent
          active={activeRoute}
          projectIntent={projectIntent?.targetRoute === activeRoute ? projectIntent : undefined}
          onNavigate={(route, intent) => {
            setProjectIntent(intent);
            setActiveRoute(route);
          }}
        />
      </View>
      <BottomNavigation
        active={activeRoute}
        onChange={(route) => {
          setProjectIntent(undefined);
          setActiveRoute(route);
        }}
        renderContent={false}
        compact
      />
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
