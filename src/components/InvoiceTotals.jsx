import React from 'react';
import { useTranslation } from 'react-i18next';

const InvoiceTotals = ({ items, profile, localeSettings }) => {
  const { t } = useTranslation();

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vatAmount = profile?.vat_enabled ? (subtotal * (profile.vat_rate / 100)) : 0;
  const total = subtotal + vatAmount;

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat(localeSettings.invoiceLocale, {
        style: 'currency',
        currency: localeSettings.currency || 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `€${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-[300px] space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{t('invoice.totals.netAmount')}</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {profile?.vat_enabled && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {t('invoice.totals.vat', { rate: profile.vat_rate })}
            </span>
            <span className="font-medium">{formatCurrency(vatAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-medium">{t('invoice.totals.totalAmount')}</span>
          <span className="font-semibold text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotals; 