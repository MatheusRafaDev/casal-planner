import React from 'react';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, size = 24, color = 'currentColor', ...props }) => {
  if (!name) return <LucideIcons.Box size={size} color={color} {...props} />;

  // Fetch the component from lucide-react dynamically
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    return <LucideIcons.Box size={size} color={color} {...props} />;
  }

  return <IconComponent size={size} color={color} {...props} />;
};

export default DynamicIcon;
