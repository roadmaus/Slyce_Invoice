import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Edit, Trash2, Building2, User2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TITLE_STORAGE_VALUES, ACADEMIC_STORAGE_VALUES, TITLE_KEYS, ACADEMIC_TITLE_KEYS } from '@/constants/titleMappings';
import { ACADEMIC_TRANSLATIONS } from '@/constants/languageMappings';

const CustomersTab = ({
  customers,
  setCustomers,
  selectedCustomer,
  setSelectedCustomer,
  newCustomer,
  setNewCustomer,
  showNewCustomerDialog,
  setShowNewCustomerDialog,
  renderCustomerForm,
  handleCustomerDialog,
  addCustomer
}) => {
  const { t, i18n } = useTranslation();

  const emptyCustomer = {
    id: '', title: '', zusatz: '', name: '', street: '', postal_code: '', city: '', firma: false,
  };

  const getTranslatedAcademicTitle = (storedTitle) => {
    const academicKey = Object.entries(ACADEMIC_STORAGE_VALUES)
      .find(([_, value]) => value === storedTitle)?.[0];
    if (academicKey) {
      const translations = ACADEMIC_TRANSLATIONS[i18n.language] || ACADEMIC_TRANSLATIONS['en'];
      return translations[academicKey];
    }
    return storedTitle;
  };

  const getCustomerDisplayName = (customer) => {
    const parts = [];
    if (customer.title &&
        customer.title !== TITLE_STORAGE_VALUES.neutral &&
        customer.title !== TITLE_STORAGE_VALUES[TITLE_KEYS.DIVERSE]) {
      const titleKey = Object.entries(TITLE_STORAGE_VALUES)
        .find(([_, value]) => value === customer.title)?.[0]?.toLowerCase();
      if (titleKey) parts.push(t(`customers.form.titles.${titleKey}`));
    }
    if (customer.zusatz && customer.zusatz !== ACADEMIC_STORAGE_VALUES.none) {
      const academicKey = Object.entries(ACADEMIC_STORAGE_VALUES)
        .find(([_, value]) => value === customer.zusatz)?.[0];
      if (academicKey) {
        const translations = ACADEMIC_TRANSLATIONS[i18n.language] || ACADEMIC_TRANSLATIONS['en'];
        parts.push(translations[academicKey]);
      }
    }
    parts.push(customer.name);
    return parts.join(' ');
  };

  return (
    <div className="b-page">
      {/* Header */}
      <div className="b-page-header">
        <span className="b-page-title">{t('customers.title')}</span>
        <button
          className="b-btn"
          onClick={() => { setNewCustomer(emptyCustomer); setShowNewCustomerDialog(true); }}
        >
          + {t('customers.actions.add')}
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={(open) => {
        if (!open) setNewCustomer(emptyCustomer);
        setShowNewCustomerDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>
              {newCustomer.id ? t('customers.actions.edit') : t('customers.actions.add')}
            </DialogTitle>
            <DialogDescription className="b-mono" style={{ fontSize: '0.75rem' }}>
              {newCustomer.id ? t('customers.dialog.editDescription') : t('customers.dialog.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {renderCustomerForm(newCustomer, setNewCustomer)}
            <div className="flex justify-end gap-2 mt-4">
              <button className="b-btn b-btn-outline" onClick={() => { setNewCustomer(emptyCustomer); setShowNewCustomerDialog(false); }}>
                {t('customers.actions.cancel')}
              </button>
              <button className="b-btn" onClick={() => {
                if (newCustomer.id && customers.find(c => c.id === newCustomer.id)) {
                  const updatedCustomers = customers.map(c =>
                    c.id === newCustomer.id ? newCustomer : c
                  );
                  setCustomers(updatedCustomers);
                  if (selectedCustomer?.id === newCustomer.id) setSelectedCustomer(newCustomer);
                } else {
                  addCustomer();
                }
                setNewCustomer(emptyCustomer);
                setShowNewCustomerDialog(false);
              }}>
                {newCustomer.id ? t('customers.actions.save') : t('customers.actions.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      {customers.length === 0 ? (
        <div className="b-empty">
          <Users className="h-10 w-10 mx-auto b-empty-icon" />
          <div className="b-empty-title">{t('customers.emptyState.title')}</div>
          <div className="b-empty-desc">{t('customers.emptyState.description')}</div>
          <button className="b-btn" onClick={() => setShowNewCustomerDialog(true)}>
            + {t('customers.emptyState.addFirst')}
          </button>
        </div>
      ) : (
        <div className="b-card-grid">
          {customers.map((customer, index) => (
            <div key={index} className="b-card">
              {/* Actions */}
              <div className="b-card-actions">
                <button className="b-icon-btn" onClick={() => handleCustomerDialog(customer)}>
                  <Edit />
                </button>
                <button className="b-icon-btn b-icon-btn-destructive" onClick={() => {
                  setCustomers(customers.filter((_, i) => i !== index));
                }}>
                  <Trash2 />
                </button>
              </div>

              {/* Name */}
              <div className="b-card-name">
                {customer.firma
                  ? <Building2 className="inline h-4 w-4 mr-2 opacity-50" />
                  : <User2 className="inline h-4 w-4 mr-2 opacity-50" />
                }
                {getCustomerDisplayName(customer)}
              </div>

              {/* Address */}
              <div className="b-card-detail-label">{t('common.address')}</div>
              <div className="b-card-detail">
                {customer.street}<br />
                {customer.postal_code} {customer.city}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {customer.zusatz && customer.zusatz !== ACADEMIC_STORAGE_VALUES.none && (
                  <div className="b-card-badge">{getTranslatedAcademicTitle(customer.zusatz)}</div>
                )}
                {customer.firma && (
                  <div className="b-card-badge">{t('customers.businessCustomer')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
