import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const INITIAL_STATE = {
  name: '',
  description: '',
  rate: '',
  quantity: '1',
  color: '#cbd5e1',
  hasDateRange: true,
  visible: true,
  personas: [],
};

export const QuickTagDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData = INITIAL_STATE,
  mode = 'create' 
}) => {
  const [formData, setFormData] = React.useState(initialData);
  const [newPersona, setNewPersona] = React.useState('');

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (mode === 'create') {
      setFormData(INITIAL_STATE);
    }
  };

  const handleAddPersona = (e) => {
    e.preventDefault();
    if (newPersona.trim() && !formData.personas.includes(newPersona.trim())) {
      setFormData(prev => ({
        ...prev,
        personas: [...prev.personas, newPersona.trim()]
      }));
      setNewPersona('');
    }
  };

  const handleRemovePersona = (personaToRemove) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.filter(p => p !== personaToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Quick Tag' : 'Edit Quick Tag'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="rate">Rate (€) *</Label>
                <Input
                  id="rate"
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, rate: e.target.value }))
                  }
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="quantity">Default Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, quantity: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, color: e.target.value }))
                  }
                  className="w-24 h-10 p-1"
                />
                <div 
                  className="flex-1 rounded-md"
                  style={{ 
                    backgroundColor: `${formData.color}20`,
                    border: `1px solid ${formData.color}`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDateRange"
                  checked={formData.hasDateRange}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasDateRange: checked }))
                  }
                />
                <Label htmlFor="hasDateRange">Use date range for this tag</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, visible: checked }))
                  }
                />
                <Label htmlFor="visible">Show in quick selection</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Associated Personas</Label>
              <div className="flex gap-2">
                <Input
                  value={newPersona}
                  onChange={(e) => setNewPersona(e.target.value)}
                  placeholder="Add persona..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPersona(e);
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={handleAddPersona}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.personas.map((persona, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {persona}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemovePersona(persona)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add Tag' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 