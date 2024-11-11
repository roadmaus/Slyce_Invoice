import React from 'react';
import { Card } from '@/components/ui/card';

export const InvoiceSummary = ({ total, invoiceNumber }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium">Invoice Number</h3>
          <p className="text-2xl font-bold">{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-medium">Total Amount</h3>
          <p className="text-2xl font-bold">
            €{total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}; 