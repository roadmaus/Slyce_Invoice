import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Building2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BusinessTab = ({
  businessProfiles,
  setBusinessProfiles,
  selectedProfile,
  setSelectedProfile,
  defaultProfileId,
  setDefaultProfileId,
  newProfile,
  setNewProfile,
  showNewProfileDialog,
  setShowNewProfileDialog,
  renderBusinessProfileForm,
  handleProfileDialog,
  addBusinessProfile
}) => {
  const { t } = useTranslation();

  const emptyProfile = {
    company_name: '', company_street: '', company_postalcode: '', company_city: '',
    tax_number: '', tax_id: '', bank_institute: '', bank_iban: '', bank_bic: '',
    contact_details: '', invoice_save_path: '', vat_enabled: false, vat_rate: 19,
  };

  return (
    <div className="b-page">
      {/* Header */}
      <div className="b-page-header">
        <span className="b-page-title">{t('business.title')}</span>
        <button
          className="b-btn"
          onClick={() => { setNewProfile(emptyProfile); setShowNewProfileDialog(true); }}
        >
          + {t('business.actions.add')}
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={showNewProfileDialog} onOpenChange={(open) => {
        if (!open) setNewProfile(emptyProfile);
        setShowNewProfileDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>
              {newProfile.company_name ? t('business.dialog.editTitle') : t('business.dialog.addTitle')}
            </DialogTitle>
            <DialogDescription className="b-mono" style={{ fontSize: '0.75rem' }}>
              {newProfile.company_name ? t('business.dialog.editDescription') : t('business.dialog.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {renderBusinessProfileForm(newProfile, setNewProfile)}
            <div className="flex justify-end gap-2 mt-4">
              <button className="b-btn b-btn-outline" onClick={() => { setNewProfile(emptyProfile); setShowNewProfileDialog(false); }}>
                {t('business.actions.cancel')}
              </button>
              <button className="b-btn" onClick={() => {
                if (newProfile.company_name && businessProfiles.find(p => p.company_name === newProfile.company_name)) {
                  const updatedProfiles = businessProfiles.map(p =>
                    p.company_name === newProfile.company_name ? newProfile : p
                  );
                  setBusinessProfiles(updatedProfiles);
                  if (selectedProfile?.company_name === newProfile.company_name) {
                    setSelectedProfile(newProfile);
                  }
                } else {
                  const isFirstProfile = businessProfiles.length === 0;
                  setBusinessProfiles([...businessProfiles, newProfile]);
                  if (isFirstProfile) {
                    setDefaultProfileId(newProfile.company_name);
                    setSelectedProfile(newProfile);
                  }
                }
                setNewProfile(emptyProfile);
                setShowNewProfileDialog(false);
              }}>
                {newProfile.company_name ? t('business.actions.save') : t('business.actions.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      {businessProfiles.length === 0 ? (
        <div className="b-empty">
          <Users className="h-10 w-10 mx-auto b-empty-icon" />
          <div className="b-empty-title">{t('business.emptyState.title')}</div>
          <div className="b-empty-desc">{t('business.emptyState.description')}</div>
          <button className="b-btn" onClick={() => setShowNewProfileDialog(true)}>
            + {t('business.emptyState.addFirst')}
          </button>
        </div>
      ) : (
        <div className="b-card-grid">
          {businessProfiles.map((profile, index) => (
            <div key={index} className="b-card">
              {/* Actions */}
              <div className="b-card-actions">
                <button className="b-icon-btn" onClick={() => handleProfileDialog(profile)}>
                  <Edit />
                </button>
                <button className="b-icon-btn b-icon-btn-destructive" onClick={() => {
                  const updatedProfiles = businessProfiles.filter((_, i) => i !== index);
                  setBusinessProfiles(updatedProfiles);
                  if (defaultProfileId === profile.company_name) setDefaultProfileId(null);
                }}>
                  <Trash2 />
                </button>
              </div>

              {/* Default toggle */}
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={defaultProfileId === profile.company_name}
                  onCheckedChange={(checked) => {
                    setDefaultProfileId(checked ? profile.company_name : null);
                    setSelectedProfile(checked ? profile : null);
                  }}
                />
                <span className="b-label" style={{ marginBottom: 0 }}>{t('business.defaultLabel')}</span>
              </div>

              {/* Name */}
              <div className="b-card-name">
                <Building2 className="inline h-4 w-4 mr-2 opacity-50" />
                {profile.company_name}
              </div>

              {/* Address */}
              <div className="b-card-detail-label">{t('common.address')}</div>
              <div className="b-card-detail">
                {profile.company_street}<br />
                {profile.company_postalcode} {profile.company_city}
              </div>

              {/* Tax */}
              {(profile.tax_number || profile.tax_id) && (
                <>
                  <div className="b-card-detail-label">{t('common.taxInfo')}</div>
                  <div className="b-card-detail">
                    {profile.tax_number && <div>{t('business.form.taxNumber')}: {profile.tax_number}</div>}
                    {profile.tax_id && <div>{t('business.form.taxId')}: {profile.tax_id}</div>}
                  </div>
                </>
              )}

              {/* Bank */}
              {(profile.bank_institute || profile.bank_iban) && (
                <>
                  <div className="b-card-detail-label">{t('common.bankDetails')}</div>
                  <div className="b-card-detail">
                    {profile.bank_institute && <div>{profile.bank_institute}</div>}
                    {profile.bank_iban && <div>IBAN: {profile.bank_iban}</div>}
                    {profile.bank_bic && <div>BIC: {profile.bank_bic}</div>}
                  </div>
                </>
              )}

              {/* VAT badge */}
              <div className="b-card-badge">
                {profile.vat_enabled
                  ? t('business.vatEnabled', { rate: profile.vat_rate })
                  : t('business.vatDisabled')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessTab;
