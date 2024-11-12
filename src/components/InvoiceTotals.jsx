import React from 'react';
import { useTranslation } from 'react-i18next';

const InvoiceTotals = ({ items, profile }) => {
  const { t } = useTranslation();

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  // Calculate VAT if enabled
  const vatAmount = profile?.vat_enabled ? (subtotal * (profile.vat_rate / 100)) : 0;

  // Calculate total
  const total = subtotal + vatAmount;

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-[300px] space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('invoice.totals.netAmount')}</span>
          <span className="font-medium">€{subtotal.toFixed(2)}</span>
        </div>

        {/* VAT */}
        {profile?.vat_enabled && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {t('invoice.totals.vat', { rate: profile.vat_rate })}
            </span>
            <span className="font-medium">€{vatAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-medium">{t('invoice.totals.totalAmount')}</span>
          <span className="font-semibold text-lg">€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotals; 