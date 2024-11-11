import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from 'sonner';
import { FileText, Users, Settings, Tags } from 'lucide-react';

// Import our custom hook
import { useSlyceInvoice } from '../hooks/useSlyceInvoice';

// We'll create these components next
import { InvoiceTab } from './tabs/InvoiceTab';
import { CustomersTab } from './tabs/CustomersTab';
import { BusinessProfilesTab } from './tabs/BusinessProfilesTab';
import { QuickTagsTab } from './tabs/QuickTagsTab';

// Dialog components we'll create later
import { EditCustomerDialog } from './dialogs/EditCustomerDialog';
import { EditProfileDialog } from './dialogs/EditProfileDialog';
import { EditTagDialog } from './dialogs/EditTagDialog';
import { WarningDialog } from './dialogs/WarningDialog';

const SlyceInvoice = () => {
  const [selectedTag, setSelectedTag] = React.useState(null);
  const {
    // Destructure everything we need from the hook
    businessProfiles,
    selectedProfile,
    customers,
    selectedCustomer,
    quickTags,
    invoiceItems,
    currentInvoiceNumber,
    invoiceDates,
    showEditCustomerDialog,
    showEditProfileDialog,
    showEditTagDialog,
    showNewTagDialog,
    showWarningDialog,
    editingCustomer,
    editingProfile,
    editingTag,
    pendingTag,
    isLoading,
    
    // Functions
    setShowEditCustomerDialog,
    setShowEditProfileDialog,
    setShowEditTagDialog,
    setShowNewTagDialog,
    setShowWarningDialog,
    editCustomer,
    editBusinessProfile,
    editQuickTag,
    deleteQuickTag,
    addQuickTag,
    generateInvoice,
    exportData,
    importData,
    // ... other functions as needed
  } = useSlyceInvoice();

  const setEditingCustomer = (customer) => {
    setCustomerState(prev => ({ ...prev, editingCustomer: customer }));
  };

  const setEditingProfile = (profile) => {
    setProfileState(prev => ({ ...prev, editingProfile: profile }));
  };

  const setEditingTag = (tag) => {
    setTagState(prev => ({ ...prev, editingTag: tag }));
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <Toaster position="top-right" expand={true} richColors />

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList>
          <TabsTrigger value="invoice">
            <FileText className="w-4 h-4 mr-2" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="business">
            <Settings className="w-4 h-4 mr-2" />
            Business Profiles
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tags className="w-4 h-4 mr-2" />
            Quick Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <InvoiceTab
            businessProfiles={businessProfiles}
            selectedProfile={selectedProfile}
            customers={customers}
            selectedCustomer={selectedCustomer}
            quickTags={quickTags}
            invoiceItems={invoiceItems}
            currentInvoiceNumber={currentInvoiceNumber}
            invoiceDates={invoiceDates}
            isLoading={isLoading}
            generateInvoice={generateInvoice}
            // ... other props as needed
          />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersTab
            customers={customers}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setShowEditCustomerDialog(true);
            }}
            // ... other props
          />
        </TabsContent>

        <TabsContent value="business">
          <BusinessProfilesTab
            businessProfiles={businessProfiles}
            isLoading={isLoading}
            onExport={exportData}
            onImport={importData}
            onEdit={(profile) => {
              setEditingProfile(profile);
              setShowEditProfileDialog(true);
            }}
            // ... other props
          />
        </TabsContent>

        <TabsContent value="tags">
          <QuickTagsTab
            quickTags={quickTags}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            showNewTagDialog={showNewTagDialog}
            setShowNewTagDialog={setShowNewTagDialog}
            addQuickTag={addQuickTag}
            onEdit={(tag) => {
              setEditingTag(tag);
              setShowEditTagDialog(true);
            }}
            onDelete={deleteQuickTag}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditCustomerDialog
        open={showEditCustomerDialog}
        onOpenChange={setShowEditCustomerDialog}
        customer={editingCustomer}
        onSave={editCustomer}
      />

      <EditProfileDialog
        open={showEditProfileDialog}
        onOpenChange={setShowEditProfileDialog}
        profile={editingProfile}
        onSave={editBusinessProfile}
      />

      <EditTagDialog
        open={showEditTagDialog}
        onOpenChange={setShowEditTagDialog}
        tag={editingTag}
        onSave={editQuickTag}
      />

      <WarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        pendingTag={pendingTag}
      />
    </div>
  );
};

export default SlyceInvoice;