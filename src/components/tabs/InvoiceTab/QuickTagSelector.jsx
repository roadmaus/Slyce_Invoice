import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tag } from 'lucide-react';

export const QuickTagSelector = ({ tags, onSelect }) => {
  const visibleTags = tags.filter(tag => tag.visible);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Quick Tags</h3>
      <ScrollArea className="h-20">
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              onClick={() => onSelect(tag)}
              style={{ 
                borderColor: tag.color,
                backgroundColor: `${tag.color}10`
              }}
            >
              <Tag className="mr-2 h-4 w-4" style={{ color: tag.color }} />
              {tag.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 