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

export const CustomerDialog = ({ open, onOpenChange, onSubmit }) => {
  const [formData, setFormData] = React.useState(INITIAL_STATE);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(INITIAL_STATE);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields similar to EditCustomerDialog */}
          <Button type="submit">Save Customer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 