import {MaterialCommunityIcons} from '@expo/vector-icons';
import React from 'react';

import type {IconName} from '@/lib/reports';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};


export const AppIcon = ({name, size = 24, color = '#2563EB'}: Props) => (
  <MaterialCommunityIcons
    name={name}
    size={size}
    color={color}
    accessibilityElementsHidden
    importantForAccessibility="no"
  />
);