import React from 'react';
import * as Icons from 'lucide-react-native';

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 20,
  color = '#FFFFFF',
}) => {
  // @ts-ignore - Lucide dynamic icon lookup
  const IconComponent = Icons[name] || Icons.CircleDot;
  return <IconComponent size={size} color={color} />;
};
