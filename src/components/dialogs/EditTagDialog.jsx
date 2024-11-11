import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export const EditTagDialog = ({ open, onOpenChange, tag, onSave }) => {
  const [formData, setFormData] = React.useState(tag || {});

  React.useEffect(() => {
    if (tag) {
      setFormData(tag);
    }
  }, [tag]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Quick Tag</DialogTitle>
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, color: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={formData.visible}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, visible: checked }))
                }
              />
              <Label htmlFor="visible">Visible in quick selection</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDateRange"
                checked={formData.hasDateRange}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasDateRange: checked }))
                }
              />
              <Label htmlFor="hasDateRange">Uses date range</Label>
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 