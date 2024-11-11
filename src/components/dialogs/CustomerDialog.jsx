import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const INITIAL_STATE = {
  title: '',
  zusatz: '',
  name: '',
  street: '',
  postal_code: '',
  city: '',
  firma: false,
};

export const CustomerDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData = INITIAL_STATE,
  mode = 'create' 
}) => {
  const [formData, setFormData] = React.useState(initialData);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="firma"
                checked={formData.firma}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, firma: checked }))
                }
              />
              <Label htmlFor="firma">Company</Label>
            </div>

            {!formData.firma && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
            )}

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">
                {formData.firma ? 'Company Name' : 'Name'} *
              </Label>
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
              <Label htmlFor="zusatz">Additional Information</Label>
              <Input
                id="zusatz"
                value={formData.zusatz}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, zusatz: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="street">Street *</Label>
              <Input
                id="street"
                required
                value={formData.street}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, street: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  required
                  value={formData.postal_code}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, postal_code: e.target.value }))
                  }
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, city: e.target.value }))
                  }
                />
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
              {mode === 'create' ? 'Add Customer' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 