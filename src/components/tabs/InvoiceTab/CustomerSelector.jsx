import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CustomerSelector = ({ customers, selectedCustomer, onSelect }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customer-select">Customer</Label>
      <Select
        value={selectedCustomer?.id || ''}
        onValueChange={(value) => {
          const customer = customers.find(c => c.id === value);
          onSelect(customer);
        }}
      >
        <SelectTrigger id="customer-select">
          <SelectValue placeholder="Select a customer" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem 
              key={customer.id} 
              value={customer.id}
            >
              {customer.firma ? customer.name : `${customer.title} ${customer.name}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCustomer && (
        <div className="mt-4 text-sm text-muted-foreground">
          {selectedCustomer.zusatz && <p>{selectedCustomer.zusatz}</p>}
          <p>{selectedCustomer.street}</p>
          <p>{selectedCustomer.postal_code} {selectedCustomer.city}</p>
        </div>
      )}
    </div>
  );
}; 