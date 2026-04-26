import type { ReactNode } from 'react';
import type { InlineAlertIntent } from '../components/InlineAlert';

export interface FieldInlineAlert {
  intent: InlineAlertIntent;
  children: ReactNode;
  showIcon?: boolean;
}
