import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Calendar, Euro, Users, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TagCard = ({ tag, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CardTitle>{tag.name}</CardTitle>
          <Badge 
            variant="outline" 
            style={{ 
              borderColor: tag.color,
              backgroundColor: `${tag.color}10`,
              color: tag.color
            }}
          >
            {tag.visible ? 'Visible' : 'Hidden'}
          </Badge>
        </div>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(tag)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tag.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="text-lg whitespace-pre-wrap">{tag.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Rate & Quantity</h3>
            <div className="flex items-center space-x-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg">{parseFloat(tag.rate).toFixed(2)}</p>
              {tag.quantity && (
                <p className="text-lg text-muted-foreground">
                  × {tag.quantity}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {tag.hasDateRange ? 'Uses date range' : 'No date range'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {tag.visible ? 'Visible in quick selection' : 'Hidden from quick selection'}
            </span>
          </div>
        </div>

        {tag.personas && tag.personas.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Associated Personas
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tag.personas.map((persona, index) => (
                <Badge key={index} variant="secondary">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div 
          className="w-full h-2 rounded-full mt-4"
          style={{ backgroundColor: tag.color }}
        />
      </CardContent>
    </Card>
  );
}; 