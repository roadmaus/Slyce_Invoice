import React from 'react';
import { useTranslation } from 'react-i18next';

const InvoiceTotals = ({ items, profile, selectedCurrency, formatCurrency }) => {
  const { t } = useTranslation();

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vatAmount = profile?.vat_enabled ? (subtotal * (profile.vat_rate / 100)) : 0;
  const total = subtotal + vatAmount;

  return (
    <div className="flex justify-end border-t-2 border-foreground pt-4">
      <div className="w-full max-w-[320px] space-y-1">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
            {t('invoice.totals.netAmount')}
          </span>
          <span className="font-mono font-bold text-sm">{formatCurrency(subtotal)}</span>
        </div>

        {profile?.vat_enabled && (
          <div className="flex justify-between items-center py-1">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
              {t('invoice.totals.vat', { rate: profile.vat_rate })}
            </span>
            <span className="font-mono font-bold text-sm">{formatCurrency(vatAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-foreground">
          <span className="text-xs uppercase tracking-widest font-bold font-mono">
            {t('invoice.totals.totalAmount')}
          </span>
          <span className="font-mono font-black text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotals;
