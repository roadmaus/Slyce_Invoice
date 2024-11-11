import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

export const CustomerCard = ({ customer, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customer Details</CardTitle>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(customer)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(customer.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
            <p className="text-lg">
              {customer.firma ? customer.name : `${customer.title} ${customer.name}`}
            </p>
          </div>
          {customer.zusatz && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Additional Info</h3>
              <p className="text-lg">{customer.zusatz}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Street</h3>
            <p className="text-lg">{customer.street}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">City</h3>
            <p className="text-lg">{customer.postal_code} {customer.city}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 