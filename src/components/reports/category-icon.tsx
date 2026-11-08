import React from 'react';

import {AppIcon} from '@/components/ui/app-icon';
import {AGENCIES, getCategory, type CategoryId} from '@/lib/reports';

type Props = {
  category: CategoryId;
  size?: number;

  color?: string;
};


export const CategoryIcon = ({category, size = 28, color}: Props) => {
  const c = getCategory(category);
  return <AppIcon name={c.icon} size={size} color={color ?? AGENCIES[c.lead].color} />;
};