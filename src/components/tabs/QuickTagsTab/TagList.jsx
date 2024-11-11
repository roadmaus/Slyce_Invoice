import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Tag, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TagList = ({ tags, selectedTag, onSelect }) => {
  const [search, setSearch] = React.useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase()) ||
    tag.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border rounded-lg h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredTags.map((tag) => (
            <Button
              key={tag.id}
              variant="ghost"
              className={cn(
                'w-full justify-start',
                selectedTag?.id === tag.id && 'bg-muted'
              )}
              onClick={() => onSelect(tag)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Tag 
                    className="h-4 w-4 mr-2" 
                    style={{ color: tag.color }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-sm text-muted-foreground">
                      €{parseFloat(tag.rate).toFixed(2)}
                    </div>
                  </div>
                </div>
                {tag.visible ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 