import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PlcForceTableCard } from './PlcForceTableCard';
import { SmartphoneSimulationPanel as SmartphoneSimulationPanelFixed } from './SmartphoneSimulationPanelFixed';
import { spacing } from '../theme/spacing';

type SmartphoneSimulationPanelEnhancedProps = React.ComponentProps<typeof SmartphoneSimulationPanelFixed>;

export const SmartphoneSimulationPanel = memo(function SmartphoneSimulationPanelEnhanced(props: SmartphoneSimulationPanelEnhancedProps) {
  return (
    <View style={styles.stack}>
      <PlcForceTableCard
        project={props.editorProject}
        state={props.plcState}
        onSetValue={props.onSetValue}
      />
      <SmartphoneSimulationPanelFixed {...props} />
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
