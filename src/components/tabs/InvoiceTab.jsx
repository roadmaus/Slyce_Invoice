import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Search, X, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InvoiceTotals from '../InvoiceTotals';

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
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border-border">
      <CardContent className="responsive-p space-y-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Customer Selection Section */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              {t('invoice.recipient.title')}
            </h3>
            <Select
              value={selectedCustomer?.name || ''}
              onValueChange={(value) => {
                const customer = customers.find(c => c.name === value);
                setSelectedCustomer(customer);
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('invoice.recipient.selectCustomer')} />
              </SelectTrigger>
              <SelectContent className="select-content">
                {customers.map((customer) => (
                  <SelectItem 
                    key={customer.name} 
                    value={customer.name}
                    className="select-item"
                  >
                    {(() => {
                      const parts = [];
                      if (customer.title && customer.title !== 'neutral') {
                        parts.push(customer.title);
                      }
                      if (customer.zusatz && customer.zusatz !== 'none') {
                        parts.push(customer.zusatz);
                      }
                      parts.push(customer.name);
                      return parts.join(' ');
                    })()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCustomer && (
              <div className="space-y-2">
                <Input 
                  value={selectedCustomer.street}
                  readOnly
                  className="bg-muted"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    value={selectedCustomer.postal_code}
                    readOnly
                    className="bg-muted"
                  />
                  <Input 
                    value={selectedCustomer.city}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invoice Details Section */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5 space-y-4">
            <h3 className="text-lg font-medium">
              {t('invoice.details.title')}
            </h3>
            <Select
              value={selectedProfile?.company_name || ''}
              onValueChange={(value) => {
                const profile = businessProfiles.find(p => p.company_name === value);
                setSelectedProfile(profile);
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('invoice.details.selectProfile')} />
              </SelectTrigger>
              <SelectContent>
                {businessProfiles.map((profile) => (
                  <SelectItem 
                    key={profile.company_name} 
                    value={profile.company_name}
                  >
                    {profile.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label>{t('invoice.details.number.label')}</Label>
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
                    window.electronAPI.setData('profileInvoiceNumbers', updatedNumbers).catch(error => {
                      console.error('Error saving invoice number:', error);
                    });
                  }
                }}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('invoice.details.number.hint')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
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
                <Label>{invoiceDates.hasDateRange ? t('invoice.details.date.servicePeriod') : t('invoice.details.date.serviceDate')}</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>{invoiceDates.hasDateRange ? t('invoice.details.date.startOfService') : t('invoice.details.date.serviceDate')}</Label>
                  <Input 
                    type="date"
                    value={invoiceDates.startDate}
                    onChange={(e) => setInvoiceDates({
                      ...invoiceDates,
                      startDate: e.target.value,
                      endDate: invoiceDates.hasDateRange ? invoiceDates.endDate : e.target.value
                    })}
                  />
                </div>
                {invoiceDates.hasDateRange && (
                  <div className="space-y-1">
                    <Label>{t('invoice.details.date.endOfService')}</Label>
                    <Input 
                      type="date"
                      value={invoiceDates.endDate}
                      onChange={(e) => setInvoiceDates({
                        ...invoiceDates,
                        endDate: e.target.value
                      })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tags Section */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-medium">Quick Entry</h3>
              <div className="relative flex items-center gap-2">
                {showTagSearch ? (
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-[200px] pl-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setShowTagSearch(false);
                          setTagSearch('');
                        }
                      }}
                    />
                    <Search 
                      className="w-4 h-4 absolute left-2.5 text-gray-500" 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-1"
                      onClick={() => {
                        setShowTagSearch(false);
                        setTagSearch('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowTagSearch(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-2 pb-12 pt-1">
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
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm 
                          bg-background/50 hover:bg-background border border-border/50 hover:border-border
                          transition-colors duration-200 group relative"
                        title={`${tag.description}\n${selectedCurrency.symbol}${parseFloat(tag.rate).toFixed(2)} × ${tag.quantity}`}
                      >
                        <div className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: adjustColorForDarkMode(tag.color || '#e2e8f0', isDarkMode) }} 
                        />
                        <span className="text-foreground/90">{tag.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedCurrency.symbol}{parseFloat(tag.rate).toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Invoice Items Section */}
        <div className="mt-6">
          <div className="overflow-x-auto rounded-md">
            <div className="min-w-[600px] p-4">
              <div className="grid grid-cols-12 gap-4 mb-4 font-medium text-foreground">
                <div className="col-span-1">Pos.</div>
                <div className="col-span-2">{t('invoice.items.quantity')}</div>
                <div className="col-span-5">{t('invoice.items.description')}</div>
                <div className="col-span-2">{t('invoice.items.rate')}</div>
                <div className="col-span-1">{t('invoice.items.total')}</div>
                <div className="col-span-1"></div>
              </div>

              {invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-4 mx-0.5">
                  <div className="col-span-1">
                    <Input
                      value={index + 1}
                      readOnly
                      className="bg-muted text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                      placeholder={t('invoice.items.description')}
                      className="w-full bg-background border-border"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder={`Rate in ${selectedCurrency.symbol}`}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      value={formatCurrency(item.quantity * item.rate)}
                      readOnly
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInvoiceItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => addInvoiceItem(invoiceDates.hasDateRange)}
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('invoice.items.addItem')}
              </Button>
            </div>
          </div>
        </div>

        {/* Add the totals component */}
        {invoiceItems.length > 0 && (
          <InvoiceTotals 
            items={invoiceItems} 
            profile={selectedProfile}
            selectedCurrency={selectedCurrency}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Total and Generate Section */}
        <div className="mt-6 flex justify-end items-center">
          <Button 
            onClick={generateInvoice} 
            disabled={isLoading.invoice}
            className="min-w-[200px]"
          >
            {isLoading.invoice ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('invoice.actions.generating')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('invoice.actions.generate')}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceTab;