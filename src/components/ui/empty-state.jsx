import React from 'react';
import { cn } from '@/lib/utils';

export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      {Icon && (
        <div className="rounded-full bg-muted p-3 mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mt-2 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}; 