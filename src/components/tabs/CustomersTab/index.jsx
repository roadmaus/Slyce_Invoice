import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerList } from './CustomerList';
import { CustomerCard } from './CustomerCard';
import { CustomerDialog } from '@/components/dialogs/CustomerDialog';

export const CustomersTab = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  setShowNewCustomerDialog,
  showNewCustomerDialog,
  addCustomer,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Button onClick={() => setShowNewCustomerDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelect={setSelectedCustomer}
          />
        </div>
        <div className="md:col-span-2">
          {selectedCustomer ? (
            <CustomerCard
              customer={selectedCustomer}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a customer to view details
            </div>
          )}
        </div>
      </div>

      <NewCustomerDialog
        open={showNewCustomerDialog}
        onOpenChange={setShowNewCustomerDialog}
        onSubmit={addCustomer}
      />
    </div>
  );
}; 