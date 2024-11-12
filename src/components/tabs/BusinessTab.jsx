import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2, Building2, MapPin, Receipt, Landmark, Users } from 'lucide-react';
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

  return (
    <Card>
      <CardContent className="responsive-p">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">{t('business.title')}</h2>
          <Dialog open={showNewProfileDialog} onOpenChange={(open) => {
            if (!open) {
              // Reset state when dialog closes
              setNewProfile({
                company_name: '',
                company_street: '',
                company_postalcode: '',
                company_city: '',
                tax_number: '',
                tax_id: '',
                bank_institute: '',
                bank_iban: '',
                bank_bic: '',
                contact_details: '',
                invoice_save_path: '',
                vat_enabled: false,
                vat_rate: 19,
              });
            }
            setShowNewProfileDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('business.actions.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {newProfile.company_name ? t('business.dialog.editTitle') : t('business.dialog.addTitle')}
                </DialogTitle>
                <DialogDescription>
                  {newProfile.company_name ? t('business.dialog.editDescription') : t('business.dialog.addDescription')}
                </DialogDescription>
              </DialogHeader>
              {renderBusinessProfileForm(newProfile, setNewProfile)}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewProfile({
                      company_name: '',
                      company_street: '',
                      company_postalcode: '',
                      company_city: '',
                      tax_number: '',
                      tax_id: '',
                      bank_institute: '',
                      bank_iban: '',
                      bank_bic: '',
                      contact_details: '',
                      invoice_save_path: '',
                      vat_enabled: false,
                      vat_rate: 19,
                    });
                    setShowNewProfileDialog(false);
                  }}
                >
                  {t('business.actions.cancel')}
                </Button>
                <Button onClick={() => {
                  if (newProfile.company_name && businessProfiles.find(p => p.company_name === newProfile.company_name)) {
                    // Handle edit case
                    const updatedProfiles = businessProfiles.map(p => 
                      p.company_name === newProfile.company_name ? newProfile : p
                    );
                    setBusinessProfiles(updatedProfiles);
                    if (selectedProfile?.company_name === newProfile.company_name) {
                      setSelectedProfile(newProfile);
                    }
                  } else {
                    // Handle add case
                    addBusinessProfile();
                  }
                  // Clear the state after saving
                  setNewProfile({
                    company_name: '',
                    company_street: '',
                    company_postalcode: '',
                    company_city: '',
                    tax_number: '',
                    tax_id: '',
                    bank_institute: '',
                    bank_iban: '',
                    bank_bic: '',
                    contact_details: '',
                    invoice_save_path: '',
                    vat_enabled: false,
                    vat_rate: 19,
                  });
                  setShowNewProfileDialog(false);
                }}>
                  {newProfile.company_name ? t('business.actions.save') : t('business.actions.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Check for empty state */}
        {businessProfiles.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-secondary/50 rounded-lg 
            border-2 border-dashed border-border">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('business.emptyState.title')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('business.emptyState.description')}
            </p>
            <Button 
              onClick={() => setShowNewProfileDialog(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('business.emptyState.addFirst')}
            </Button>
          </div>
        ) : (
          <div className="responsive-grid responsive-gap">
            {businessProfiles.map((profile, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-border/50 hover:border-border 
                  transition-all duration-200 hover:shadow-lg"
              >
                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 
                  group-hover:opacity-100 transition-all duration-200 translate-y-1 
                  group-hover:translate-y-0 z-20">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                    onClick={() => handleProfileDialog(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                    onClick={() => {
                      const updatedProfiles = businessProfiles.filter((_, i) => i !== index);
                      setBusinessProfiles(updatedProfiles);
                      if (defaultProfileId === profile.company_name) {
                        setDefaultProfileId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Default Toggle */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <Switch
                    checked={defaultProfileId === profile.company_name}
                    onCheckedChange={(checked) => {
                      const newDefaultId = checked ? profile.company_name : null;
                      setDefaultProfileId(newDefaultId);
                      if (checked) {
                        setSelectedProfile(profile);
                      } else {
                        setSelectedProfile(null);
                      }
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('business.defaultLabel')}
                  </span>
                </div>

                <CardContent className="p-5 mt-8">
                  {/* Profile Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg text-foreground/90 truncate">
                        {profile.company_name}
                      </h3>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4">
                    {/* Address Section */}
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {t('common.address')}
                      </div>
                      <div className="text-sm text-foreground/80 pl-5">
                        {profile.company_street}
                        <br />
                        {profile.company_postalcode} {profile.company_city}
                      </div>
                    </div>

                    {/* Tax Info Section */}
                    {(profile.tax_number || profile.tax_id) && (
                      <div className="space-y-1.5">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Receipt className="h-3.5 w-3.5" />
                          {t('common.taxInfo')}
                        </div>
                        <div className="text-sm text-foreground/80 pl-5 space-y-0.5">
                          {profile.tax_number && (
                            <div>{t('business.form.taxNumber')}: {profile.tax_number}</div>
                          )}
                          {profile.tax_id && (
                            <div>{t('business.form.taxId')}: {profile.tax_id}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bank Details Section */}
                    {(profile.bank_institute || profile.bank_iban || profile.bank_bic) && (
                      <div className="space-y-1.5">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Landmark className="h-3.5 w-3.5" />
                          {t('common.bankDetails')}
                        </div>
                        <div className="text-sm text-foreground/80 pl-5 space-y-0.5">
                          {profile.bank_institute && (
                            <div>{profile.bank_institute}</div>
                          )}
                          {profile.bank_iban && (
                            <div>IBAN: {profile.bank_iban}</div>
                          )}
                          {profile.bank_bic && (
                            <div>BIC: {profile.bank_bic}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VAT Status */}
                    <div className="flex items-center justify-center p-1.5 rounded-md
                      bg-background/40 dark:bg-background/20 backdrop-blur-sm mt-4">
                      <span className="text-xs text-muted-foreground">
                        {profile.vat_enabled 
                          ? t('business.vatEnabled', { rate: profile.vat_rate })
                          : t('business.vatDisabled')}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 
                    via-transparent to-transparent opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessTab;