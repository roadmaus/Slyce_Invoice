import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import { ProfileSelector } from './ProfileSelector';
import { CustomerSelector } from './CustomerSelector';
import { DateRangePicker } from './DateRangePicker';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { QuickTagSelector } from './QuickTagSelector';
import { InvoiceSummary } from './InvoiceSummary';

export const InvoiceTab = ({
  businessProfiles,
  selectedProfile,
  customers,
  selectedCustomer,
  quickTags,
  invoiceItems,
  currentInvoiceNumber,
  invoiceDates,
  isLoading,
  // Functions
  setSelectedProfile,
  setSelectedCustomer,
  setInvoiceDates,
  addInvoiceItem,
  updateInvoiceItem,
  removeInvoiceItem,
  generateInvoice,
}) => {
  const canGenerateInvoice = selectedProfile && 
    selectedCustomer && 
    invoiceItems.length > 0 &&
    invoiceDates.startDate &&
    invoiceDates.endDate;

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => {
      const amount = parseFloat(item.rate) * parseFloat(item.quantity);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Selection */}
        <Card>
          <CardContent className="pt-6">
            <ProfileSelector
              profiles={businessProfiles}
              selectedProfile={selectedProfile}
              onSelect={setSelectedProfile}
            />
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card>
          <CardContent className="pt-6">
            <CustomerSelector
              customers={customers}
              selectedCustomer={selectedCustomer}
              onSelect={setSelectedCustomer}
            />
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardContent className="pt-6">
          <DateRangePicker
            dates={invoiceDates}
            onChange={setInvoiceDates}
          />
        </CardContent>
      </Card>

      {/* Quick Tags */}
      <Card>
        <CardContent className="pt-6">
          <QuickTagSelector
            tags={quickTags}
            onSelect={(tag) => {
              addInvoiceItem({
                description: tag.description,
                rate: tag.rate,
                quantity: tag.quantity || 1,
                hasDateRange: tag.hasDateRange,
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Invoice Items Table */}
      <Card>
        <CardContent className="pt-6">
          <InvoiceItemsTable
            items={invoiceItems}
            onUpdate={updateInvoiceItem}
            onRemove={removeInvoiceItem}
            onAdd={() => addInvoiceItem({
              description: '',
              rate: '',
              quantity: 1,
              hasDateRange: true,
            })}
          />
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardContent className="pt-6">
          <InvoiceSummary
            total={calculateTotal()}
            invoiceNumber={currentInvoiceNumber}
          />
        </CardContent>
      </Card>

      {/* Generate Invoice Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={generateInvoice}
          disabled={!canGenerateInvoice || isLoading.invoice}
        >
          {isLoading.invoice && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate Invoice
        </Button>
      </div>
    </div>
  );
}; 