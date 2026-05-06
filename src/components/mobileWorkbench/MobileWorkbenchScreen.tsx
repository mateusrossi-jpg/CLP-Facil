import { ComponentProps, memo } from 'react';
import { MobilePlcExperience } from '../MobilePlcExperience';

type Props = ComponentProps<typeof MobilePlcExperience>;

export const MobileWorkbenchScreen = memo(function MobileWorkbenchScreen(props: Props) {
  return <MobilePlcExperience {...props} />;
});
