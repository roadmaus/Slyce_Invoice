import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Search, X, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import InvoiceTotals from '../InvoiceTotals';
import { TITLE_TRANSLATIONS, ACADEMIC_TRANSLATIONS } from '@/constants/languageMappings';
import { TITLE_KEYS, ACADEMIC_TITLE_KEYS, TITLE_STORAGE_VALUES, ACADEMIC_STORAGE_VALUES } from '@/constants/titleMappings';

const InvoiceTab = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  businessProfiles,
  selectedProfile,
  setSelectedProfile,
  currentInvoiceNumber,
  setCurrentInvoiceNumber,
  invoiceDates,
  setInvoiceDates,
  showTagSearch,
  setShowTagSearch,
  tagSearch,
  setTagSearch,
  quickTags,
  handleQuickTagClick,
  isDarkMode,
  adjustColorForDarkMode,
  Icons,
  invoiceItems,
  updateInvoiceItem,
  deleteInvoiceItem,
  addInvoiceItem,
  generateInvoice,
  isLoading,
  profileInvoiceNumbers,
  setProfileInvoiceNumbers,
  selectedCurrency,
  formatCurrency,
  invoiceReference,
  setInvoiceReference,
  invoicePaid,
  setInvoicePaid,
}) => {
  const { t, i18n } = useTranslation();

  const getTranslatedTitle = (storedTitle) => {
    if (storedTitle === TITLE_STORAGE_VALUES[TITLE_KEYS.DIVERSE]) {
      return '';
    }
    const titleKey = Object.entries(TITLE_STORAGE_VALUES)
      .find(([_, value]) => value === storedTitle)?.[0];
    const translations = TITLE_TRANSLATIONS[i18n.language] || TITLE_TRANSLATIONS['en'];
    return titleKey ? translations[titleKey] : storedTitle;
  };

  const getTranslatedAcademicTitle = (storedTitle) => {
    const titleKey = Object.entries(ACADEMIC_STORAGE_VALUES)
      .find(([_, value]) => value === storedTitle)?.[0];
    const translations = ACADEMIC_TRANSLATIONS[i18n.language] || ACADEMIC_TRANSLATIONS['en'];
    return titleKey ? translations[titleKey] : storedTitle;
  };

  return (
    <div className="brutalist-invoice">
      {/* Header bar */}
      <div className="brutalist-header">
        <span className="brutalist-title">INVOICE</span>
        <span className="font-mono text-sm tracking-tight opacity-70">
          {currentInvoiceNumber || '—'}
        </span>
      </div>

      {/* 3-column top section */}
      <div className="brutalist-grid-3">
        {/* Column 1: Recipient */}
        <div className="brutalist-section">
          <div className="brutalist-label">{t('invoice.recipient.title')}</div>
          <Select
            value={selectedCustomer?.name || ''}
            onValueChange={(value) => {
              const customer = customers.find(c => c.name === value);
              setSelectedCustomer(customer);
            }}
          >
            <SelectTrigger className="brutalist-input">
              <SelectValue placeholder={t('invoice.recipient.selectCustomer')} />
            </SelectTrigger>
            <SelectContent className="select-content">
              {customers.map((customer) => (
                <SelectItem
                  key={customer.name}
                  value={customer.name}
                  className="select-item font-mono text-sm"
                >
                  {(() => {
                    const parts = [];
                    if (customer.title && customer.title !== 'neutral') {
                      parts.push(getTranslatedTitle(customer.title));
                    }
                    if (customer.zusatz && customer.zusatz !== 'none') {
                      parts.push(getTranslatedAcademicTitle(customer.zusatz));
                    }
                    parts.push(customer.name);
                    return parts.join(' ');
                  })()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCustomer && (
            <div className="space-y-1 mt-2">
              <input
                value={selectedCustomer.street}
                readOnly
                className="brutalist-input brutalist-input-readonly w-full"
              />
              <div className="grid grid-cols-2 gap-0">
                <input
                  value={selectedCustomer.postal_code}
                  readOnly
                  className="brutalist-input brutalist-input-readonly w-full border-r-0"
                />
                <input
                  value={selectedCustomer.city}
                  readOnly
                  className="brutalist-input brutalist-input-readonly w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Details */}
        <div className="brutalist-section brutalist-border-l">
          <div className="brutalist-label">{t('invoice.details.title')}</div>
          <Select
            value={selectedProfile?.company_name || ''}
            onValueChange={(value) => {
              const profile = businessProfiles.find(p => p.company_name === value);
              setSelectedProfile(profile);
            }}
          >
            <SelectTrigger className="brutalist-input">
              <SelectValue placeholder={t('invoice.details.selectProfile')} />
            </SelectTrigger>
            <SelectContent>
              {businessProfiles.map((profile) => (
                <SelectItem
                  key={profile.company_name}
                  value={profile.company_name}
                  className="font-mono text-sm"
                >
                  {profile.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-2">
            <div className="brutalist-field-label">{t('invoice.details.number.label')}</div>
            <Input
              value={currentInvoiceNumber}
              onChange={(e) => {
                const newNumber = e.target.value;
                setCurrentInvoiceNumber(newNumber);
                if (selectedProfile) {
                  const updatedNumbers = {
                    ...profileInvoiceNumbers,
                    [selectedProfile.company_name]: newNumber
                  };
                  setProfileInvoiceNumbers(updatedNumbers);
                  api.setData('profileInvoiceNumbers', updatedNumbers).catch(error => {
                    console.error('Error saving invoice number:', error);
                  });
                }
              }}
              placeholder={t('invoice.details.number.hint')}
              className="brutalist-input font-mono"
            />
          </div>

          <div className="mt-2">
            <div className="brutalist-field-label">{t('invoice.details.reference.label')}</div>
            <Input
              value={invoiceReference}
              onChange={(e) => setInvoiceReference(e.target.value)}
              placeholder={t('invoice.details.reference.placeholder')}
              className="brutalist-input font-mono"
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={invoicePaid}
                onCheckedChange={setInvoicePaid}
              />
              <span className="brutalist-field-label mb-0">{t('invoice.details.markAsPaid')}</span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={invoiceDates.showDate}
                onCheckedChange={(checked) => setInvoiceDates({
                  ...invoiceDates,
                  showDate: checked
                })}
              />
              <span className="brutalist-field-label mb-0">
                {t('invoice.details.date.showDate')}
              </span>
            </div>

            {invoiceDates.showDate && (
              <>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={invoiceDates.hasDateRange}
                    onCheckedChange={(checked) => setInvoiceDates({
                      ...invoiceDates,
                      hasDateRange: checked,
                      startDate: '',
                      endDate: ''
                    })}
                    disabled={invoiceItems.length > 0}
                  />
                  <span className="brutalist-field-label mb-0">
                    {invoiceDates.hasDateRange ? t('invoice.details.date.servicePeriod') : t('invoice.details.date.serviceDate')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-0">
                  <div>
                    <div className="brutalist-field-label">
                      {invoiceDates.hasDateRange ? t('invoice.details.date.startOfService') : t('invoice.details.date.serviceDate')}
                    </div>
                    <Input
                      type="date"
                      value={invoiceDates.startDate}
                      onChange={(e) => setInvoiceDates({
                        ...invoiceDates,
                        startDate: e.target.value,
                        endDate: invoiceDates.hasDateRange ? invoiceDates.endDate : e.target.value
                      })}
                      className="brutalist-input font-mono border-r-0"
                    />
                  </div>
                  {invoiceDates.hasDateRange && (
                    <div>
                      <div className="brutalist-field-label">{t('invoice.details.date.endOfService')}</div>
                      <Input
                        type="date"
                        value={invoiceDates.endDate}
                        onChange={(e) => setInvoiceDates({
                          ...invoiceDates,
                          endDate: e.target.value
                        })}
                        className="brutalist-input font-mono"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 3: Quick Tags */}
        <div className="brutalist-section brutalist-border-l">
          <div className="flex items-center justify-between">
            <div className="brutalist-label">Quick Entry</div>
            <div className="flex items-center">
              {showTagSearch ? (
                <div className="flex items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="brutalist-input font-mono text-xs w-[140px] pl-6 h-7"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowTagSearch(false);
                          setTagSearch('');
                        }
                      }}
                    />
                    <Search className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <button
                    className="ml-1 p-1 hover:bg-foreground/10"
                    onClick={() => {
                      setShowTagSearch(false);
                      setTagSearch('');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  className="p-1 hover:bg-foreground/10"
                  onClick={() => setShowTagSearch(true)}
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="relative mt-1">
            <div className="flex flex-wrap gap-1 max-h-[220px] overflow-y-auto pb-8 pt-1">
              {quickTags
                .filter(tag =>
                  tag.visible &&
                  selectedProfile &&
                  (tag.personas || []).includes(selectedProfile.company_name) &&
                  tag.name.toLowerCase().includes(tagSearch.toLowerCase())
                )
                .map((tag, index) => {
                  const TagIcon = Icons[tag.icon];
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickTagClick(tag)}
                      className="brutalist-tag group"
                      title={`${tag.description}\n${selectedCurrency.symbol}${parseFloat(tag.rate).toFixed(2)} × ${tag.quantity}`}
                    >
                      <div className="w-2 h-2"
                        style={{ backgroundColor: adjustColorForDarkMode(tag.color || '#e2e8f0', isDarkMode) }}
                      />
                      <span className="text-foreground/90">{tag.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {selectedCurrency.symbol}{parseFloat(tag.rate).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="brutalist-table-wrap">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th className="w-[50px]">#</th>
              <th className="w-[80px]">{t('invoice.items.quantity')}</th>
              <th>{t('invoice.items.description')}</th>
              <th className="w-[120px]">{t('invoice.items.rate')}</th>
              <th className="w-[120px]">{t('invoice.items.total')}</th>
              <th className="w-[44px]"></th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className="brutalist-pos">{String(index + 1).padStart(2, '0')}</span>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value))}
                    min="0"
                    step="0.5"
                    className="brutalist-cell-input"
                  />
                </td>
                <td>
                  <input
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    placeholder={t('invoice.items.description')}
                    className="brutalist-cell-input w-full"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="brutalist-cell-input text-right"
                  />
                </td>
                <td>
                  <span className="font-mono text-sm font-bold text-right block">
                    {formatCurrency(item.quantity * item.rate)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => deleteInvoiceItem(index)}
                    className="p-1 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => addInvoiceItem(invoiceDates.hasDateRange)}
          className="brutalist-add-btn"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>{t('invoice.items.addItem')}</span>
        </button>
      </div>

      {/* Totals */}
      {invoiceItems.length > 0 && (
        <div className="p-4">
          <InvoiceTotals
            items={invoiceItems}
            profile={selectedProfile}
            selectedCurrency={selectedCurrency}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateInvoice}
        disabled={isLoading.invoice}
        className="brutalist-generate-btn"
      >
        {isLoading.invoice ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('invoice.actions.generating')}</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>{t('invoice.actions.generate')}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default InvoiceTab;
