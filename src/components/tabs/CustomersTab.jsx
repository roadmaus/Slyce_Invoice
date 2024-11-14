import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Building2, MapPin, User2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TITLE_STORAGE_VALUES, ACADEMIC_STORAGE_VALUES, TITLE_KEYS } from '@/constants/titleMappings';

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
  const { t } = useTranslation();

  // Helper function to get display name
  const getCustomerDisplayName = (customer) => {
    const parts = [];
    if (customer.title && 
        customer.title !== TITLE_STORAGE_VALUES.neutral && 
        customer.title !== TITLE_STORAGE_VALUES[TITLE_KEYS.DIVERSE]) {
      // Translate the stored title
      const titleKey = Object.entries(TITLE_STORAGE_VALUES)
        .find(([_, value]) => value === customer.title)?.[0]?.toLowerCase();
      if (titleKey) {
        parts.push(t(`customers.form.titles.${titleKey}`));
      }
    }
    
    if (customer.zusatz && customer.zusatz !== ACADEMIC_STORAGE_VALUES.none) {
      // For academic titles, we use the stored value directly as they're standardized
      parts.push(customer.zusatz);
    }
    
    parts.push(customer.name);
    return parts.join(' ');
  };

  return (
    <Card className="border-border">
      <CardContent className="responsive-p">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">{t('customers.title')}</h2>
          <Dialog open={showNewCustomerDialog} onOpenChange={(open) => {
            if (!open) {
              setNewCustomer({
                id: '',
                title: '',
                zusatz: '',
                name: '',
                street: '',
                postal_code: '',
                city: '',
                firma: false,
              });
            }
            setShowNewCustomerDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('customers.actions.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{newCustomer.id ? t('customers.actions.edit') : t('customers.actions.add')}</DialogTitle>
                <DialogDescription>
                  {newCustomer.id ? t('customers.dialog.editDescription') : t('customers.dialog.addDescription')}
                </DialogDescription>
              </DialogHeader>
              {renderCustomerForm(newCustomer, setNewCustomer)}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewCustomer({
                      id: '',
                      title: '',
                      zusatz: '',
                      name: '',
                      street: '',
                      postal_code: '',
                      city: '',
                      firma: false,
                    });
                    setShowNewCustomerDialog(false);
                  }}
                >
                  {t('customers.actions.cancel')}
                </Button>
                <Button onClick={() => {
                  if (newCustomer.id && customers.find(c => c.id === newCustomer.id)) {
                    const updatedCustomers = customers.map(c => 
                      c.id === newCustomer.id ? newCustomer : c
                    );
                    setCustomers(updatedCustomers);
                    if (selectedCustomer?.id === newCustomer.id) {
                      setSelectedCustomer(newCustomer);
                    }
                  } else {
                    addCustomer();
                  }
                  setNewCustomer({
                    id: '',
                    title: '',
                    zusatz: '',
                    name: '',
                    street: '',
                    postal_code: '',
                    city: '',
                    firma: false,
                  });
                  setShowNewCustomerDialog(false);
                }}>
                  {newCustomer.id ? t('customers.actions.save') : t('customers.actions.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customers Grid */}
        <div className="responsive-grid responsive-gap">
          {customers.map((customer, index) => (
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
                  onClick={() => handleCustomerDialog(customer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                  onClick={() => {
                    const updatedCustomers = customers.filter((_, i) => i !== index);
                    setCustomers(updatedCustomers);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-5 mt-8">
                {/* Customer Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    {customer.firma ? (
                      <Building2 className="h-4 w-4 text-primary" />
                    ) : (
                      <User2 className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold text-lg text-foreground/90 truncate">
                      {getCustomerDisplayName(customer)}
                    </h3>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  {/* Address Section */}
                  <div className="space-y-1.5">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {t('common.address')}
                    </div>
                    <div className="text-sm text-foreground/80 pl-5">
                      {customer.street}
                      <br />
                      {customer.postal_code} {customer.city}
                    </div>
                  </div>

                  {/* Customer Type */}
                  <div className="flex items-center justify-center p-1.5 rounded-md
                    bg-background/40 dark:bg-background/20 backdrop-blur-sm">
                    <span className="text-xs text-muted-foreground">
                      {customer.zusatz !== 'none' && `${customer.zusatz}`}
                      {customer.firma && (customer.zusatz !== 'none' ? ` • ${t('customers.businessCustomer')}` : t('customers.businessCustomer'))}
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

          {/* Empty State */}
          {customers.length === 0 && (
            <div className="col-span-full text-center py-12 bg-secondary/50 rounded-lg 
              border-2 border-dashed border-border">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('customers.emptyState.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('customers.emptyState.description')}
              </p>
              <Button 
                onClick={() => setShowNewCustomerDialog(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('customers.emptyState.addFirst')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersTab; 