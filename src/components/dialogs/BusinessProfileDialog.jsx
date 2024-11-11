import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const INITIAL_STATE = {
  company_name: '',
  company_street: '',
  company_postalcode: '',
  company_city: '',
  tax_number: '',
  tax_id: '',
  bank_institute: '',
  bank_iban: '',
  bank_bic: '',
  contact_details: '',
  invoice_save_path: '',
};

export const BusinessProfileDialog = ({ 
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Business Profile' : 'Edit Business Profile'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, company_name: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="company_street">Street *</Label>
              <Input
                id="company_street"
                required
                value={formData.company_street}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, company_street: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="company_postalcode">Postal Code *</Label>
              <Input
                id="company_postalcode"
                required
                value={formData.company_postalcode}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, company_postalcode: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="company_city">City *</Label>
              <Input
                id="company_city"
                required
                value={formData.company_city}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, company_city: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="tax_number">Tax Number</Label>
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, tax_number: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, tax_id: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bank_institute">Bank Institute</Label>
              <Input
                id="bank_institute"
                value={formData.bank_institute}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, bank_institute: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bank_iban">IBAN</Label>
              <Input
                id="bank_iban"
                value={formData.bank_iban}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, bank_iban: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bank_bic">BIC</Label>
              <Input
                id="bank_bic"
                value={formData.bank_bic}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, bank_bic: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="contact_details">Contact Details</Label>
              <Textarea
                id="contact_details"
                value={formData.contact_details}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, contact_details: e.target.value }))
                }
              />
            </div>

            <div className="col-span-2 grid w-full items-center gap-1.5">
              <Label htmlFor="invoice_save_path">Invoice Save Path</Label>
              <Input
                id="invoice_save_path"
                value={formData.invoice_save_path}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, invoice_save_path: e.target.value }))
                }
              />
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
              {mode === 'create' ? 'Add Profile' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 