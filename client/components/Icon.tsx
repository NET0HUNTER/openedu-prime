import React from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const DynamicIcon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name,
  className = '',
  size = 18,
}) => {
  const Comp = ((Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Box) as LucideIcon;
  return <Comp className={className} size={size} />;
};
