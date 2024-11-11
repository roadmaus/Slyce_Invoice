import React from 'react';
import { useSlyceInvoiceLogic } from './SlyceInvoiceLogic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';
import * as Icons from 'lucide-react';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Save, 
  Upload, 
  FileText, 
  Users, 
  Settings, 
  Tags,
  Loader2 
} from 'lucide-react';
import { Toaster } from 'sonner';

const SlyceInvoice = () => {
  // Get all state and functions from the logic hook
  const {
    // States
    businessProfiles,
    selectedProfile,
    customers,
    selectedCustomer,
    quickTags,
    invoices,
    currentInvoice,
    showBusinessProfileForm,
    showCustomerForm,
    showQuickTagForm,
    editingProfile,
    editingCustomer,
    editingQuickTag,

    // State Setters
    setSelectedProfile,
    setSelectedCustomer,
    setShowBusinessProfileForm,
    setShowCustomerForm,
    setShowQuickTagForm,
    setEditingProfile,
    setEditingCustomer,
    setEditingQuickTag,
    setCurrentInvoice,

    // Business Profile Functions
    addBusinessProfile,
    editBusinessProfile,
    deleteBusinessProfile,

    // Customer Functions
    addCustomer,
    editCustomer,
    deleteCustomer,

    // Quick Tag Functions
    addQuickTag,
    editQuickTag,
    deleteQuickTag,

    // Invoice Functions
    createInvoice,
    updateInvoice,
    deleteInvoice,
    exportToPDF,

    // Invoice Item Functions
    addInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,

    // Constants
    PREDEFINED_COLORS,
  } = useSlyceInvoiceLogic();

  // Form rendering functions
  const renderBusinessProfileForm = (profile, setProfile) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={profile.company_name || ''}
          onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="company_street">Street Address</Label>
        <Input
          id="company_street"
          value={profile.company_street || ''}
          onChange={(e) => setProfile({ ...profile, company_street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_postalcode">Postal Code</Label>
          <Input
            id="company_postalcode"
            value={profile.company_postalcode || ''}
            onChange={(e) => setProfile({ ...profile, company_postalcode: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="company_city">City</Label>
          <Input
            id="company_city"
            value={profile.company_city || ''}
            onChange={(e) => setProfile({ ...profile, company_city: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="company_country">Country</Label>
        <Input
          id="company_country"
          value={profile.company_country || ''}
          onChange={(e) => setProfile({ ...profile, company_country: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="company_email">Email</Label>
        <Input
          id="company_email"
          type="email"
          value={profile.company_email || ''}
          onChange={(e) => setProfile({ ...profile, company_email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="company_phone">Phone</Label>
        <Input
          id="company_phone"
          value={profile.company_phone || ''}
          onChange={(e) => setProfile({ ...profile, company_phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="company_website">Website</Label>
        <Input
          id="company_website"
          value={profile.company_website || ''}
          onChange={(e) => setProfile({ ...profile, company_website: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="company_vat">VAT Number</Label>
        <Input
          id="company_vat"
          value={profile.company_vat || ''}
          onChange={(e) => setProfile({ ...profile, company_vat: e.target.value })}
        />
      </div>
    </div>
  );

  const renderCustomerForm = (customer, setCustomer) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={customer.name || ''}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={customer.street || ''}
          onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={customer.postal_code || ''}
            onChange={(e) => setCustomer({ ...customer, postal_code: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={customer.city || ''}
            onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          value={customer.country || ''}
          onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={customer.email || ''}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={customer.phone || ''}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="vat">VAT Number</Label>
        <Input
          id="vat"
          value={customer.vat || ''}
          onChange={(e) => setCustomer({ ...customer, vat: e.target.value })}
        />
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <Toaster position="top-right" />
      
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Invoices</h2>
            <Button onClick={() => createInvoice()} disabled={!selectedProfile || !selectedCustomer}>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>

          {/* Invoice List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{invoice.number}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => exportToPDF(invoice.id)}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInvoice(invoice.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Customers</h2>
            <Button onClick={() => setShowCustomerForm(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Customer List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCustomer(customer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Business Profiles</h2>
            <Button onClick={() => setShowBusinessProfileForm(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Profile
            </Button>
          </div>

          {/* Business Profile List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businessProfiles.map((profile) => (
              <Card key={profile.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{profile.company_name}</h3>
                      <p className="text-sm text-gray-500">{profile.company_email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingProfile(profile)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBusinessProfile(profile.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showBusinessProfileForm} onOpenChange={setShowBusinessProfileForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Business Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const profile = Object.fromEntries(formData.entries());
            addBusinessProfile(profile);
          }}>
            {renderBusinessProfileForm({}, (profile) => profile)}
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowBusinessProfileForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Business Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const profile = Object.fromEntries(formData.entries());
            editBusinessProfile({ ...editingProfile, ...profile });
          }}>
            {editingProfile && renderBusinessProfileForm(editingProfile, (profile) => profile)}
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Profile</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const customer = Object.fromEntries(formData.entries());
            addCustomer(customer);
          }}>
            {renderCustomerForm({}, (customer) => customer)}
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowCustomerForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const customer = Object.fromEntries(formData.entries());
            editCustomer({ ...editingCustomer, ...customer });
          }}>
            {editingCustomer && renderCustomerForm(editingCustomer, (customer) => customer)}
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlyceInvoice;