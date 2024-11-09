import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Trash2, Save, Settings, Users, Tags, FileText, Edit, Check, Upload } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';

// Helper Functions
const generateInvoiceNumber = (lastNumber) => {
  const year = new Date().getFullYear();
  const currentYearPrefix = `${year}_`;
  
  if (!lastNumber || !lastNumber.startsWith(currentYearPrefix)) {
    return `${currentYearPrefix}00001`;
  }

  const sequence = parseInt(lastNumber.split('_')[1]) + 1;
  return `${currentYearPrefix}${sequence.toString().padStart(5, '0')}`;
};

const validateBusinessProfile = (profile) => {
  const required = ['company_name', 'company_street', 'company_postalcode', 'company_city'];
  return required.every(field => profile[field]?.trim());
};

const validateCustomer = (customer) => {
  const required = ['name', 'street', 'postal_code', 'city'];
  return required.every(field => customer[field]?.trim());
};

const SlyceInvoice = () => {
  // Business Profiles State
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({
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
  });

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    title: '',
    zusatz: '',
    name: '',
    street: '',
    postal_code: '',
    city: '',
    firma: false,
  });

  // Quick Tags State
  const [quickTags, setQuickTags] = useState([]);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    rate: '',
    quantity: '',
    color: '#e2e8f0',
    hasDateRange: true,
    visible: true,
    personas: [],
  });

  // Invoice State
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState('');
  const [invoiceDates, setInvoiceDates] = useState({
    startDate: '',
    endDate: '',
    hasDateRange: true,
  });

  // UI State
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: '' });
  const [isInitialized, setIsInitialized] = useState(false);

  // Edit State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showEditTagDialog, setShowEditTagDialog] = useState(false);

  // Default Profile State
  const [defaultProfileId, setDefaultProfileId] = useState(null);

// Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedProfiles = await window.electronAPI.getData('businessProfiles');
        const savedCustomers = await window.electronAPI.getData('customers');
        const savedTags = await window.electronAPI.getData('quickTags');
        const lastInvoiceNumber = await window.electronAPI.getData('lastInvoiceNumber');
        const savedDefaultProfileId = await window.electronAPI.getData('defaultProfileId');

        if (savedProfiles) setBusinessProfiles(savedProfiles);
        if (savedCustomers) setCustomers(savedCustomers);
        if (savedTags) setQuickTags(savedTags);
        if (lastInvoiceNumber) setCurrentInvoiceNumber(generateInvoiceNumber(lastInvoiceNumber));
        
        if (savedDefaultProfileId) {
          setDefaultProfileId(savedDefaultProfileId);
          const defaultProfile = savedProfiles?.find(p => p.company_name === savedDefaultProfileId);
          if (defaultProfile) setSelectedProfile(defaultProfile);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsInitialized(true);
      }
    };

    loadSavedData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveData = async () => {
        await window.electronAPI.setData('businessProfiles', businessProfiles);
        await window.electronAPI.setData('customers', customers);
        await window.electronAPI.setData('quickTags', quickTags);
        if (defaultProfileId) {
          await window.electronAPI.setData('defaultProfileId', defaultProfileId);
        }
      };
      saveData();
    }
  }, [businessProfiles, customers, quickTags, defaultProfileId, isInitialized]);

  // Business Profile Management
  const addBusinessProfile = () => {
    if (!validateBusinessProfile(newProfile)) {
      setShowAlert({
        show: true,
        message: 'Please fill in all required fields.',
      });
      return;
    }

    if (businessProfiles.length >= 20) {
      setShowAlert({
        show: true,
        message: 'Maximum of 20 business profiles reached.',
      });
      return;
    }

    setBusinessProfiles([...businessProfiles, newProfile]);
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
    });
    setShowNewProfileDialog(false);
  };

  // Customer Management
  const addCustomer = () => {
    if (!validateCustomer(newCustomer)) {
      setShowAlert({
        show: true,
        message: 'Please fill in all required fields.',
      });
      return;
    }

    setCustomers([...customers, newCustomer]);
    setNewCustomer({
      title: '',
      zusatz: '',
      name: '',
      street: '',
      postal_code: '',
      city: '',
      firma: false,
    });
    setShowNewCustomerDialog(false);
  };

  // Quick Tags Management
  const addQuickTag = () => {
    if (quickTags.length >= 20) {
      setShowAlert({
        show: true,
        message: 'Maximum of 20 quick tags reached.',
      });
      return;
    }

    if (!selectedProfile) {
      setShowAlert({
        show: true,
        message: 'Please select a business profile first.',
      });
      return;
    }

    const tagWithPersona = {
      ...newTag,
      personas: [selectedProfile.company_name],
    };

    setQuickTags([...quickTags, tagWithPersona]);
    setNewTag({
      name: '',
      description: '',
      rate: '',
      quantity: '',
      color: '#e2e8f0',
      hasDateRange: true,
      visible: true,
      personas: [],
    });
    setShowNewTagDialog(false);
  };

// Invoice Management Functions
  const addInvoiceItem = (hasDateRange = true) => {
    setInvoiceItems([
      ...invoiceItems,
      {
        description: '',
        quantity: 1,
        rate: 0,
        total: 0,
        hasDateRange,
      },
    ]);
    
    // Automatically update the date range toggle based on items
    updateDateRangeToggle([...invoiceItems, { hasDateRange }]);
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    newItems[index].total = newItems[index].quantity * newItems[index].rate;
    setInvoiceItems(newItems);
  };

  const deleteInvoiceItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
    updateDateRangeToggle(newItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.quantity * item.rate, 0).toFixed(2);
  };

  const generateInvoice = async () => {
    if (!validateInvoice()) {
      return;
    }

    try {
      // Load your invoice template
      const template = await window.electronAPI.getInvoiceTemplate();

      // Format customer address
      const customerAddress = `${selectedCustomer.title !== 'Divers' ? selectedCustomer.title : ''} ${selectedCustomer.zusatz} ${selectedCustomer.name}<br>
        ${selectedCustomer.street}<br>
        ${selectedCustomer.postal_code} ${selectedCustomer.city}`;

      // Format invoice details
      const invoiceNumberDate = `Rechnungsnummer: ${currentInvoiceNumber}<br>
        Datum: ${new Date().toLocaleDateString('de-DE')}`;

      // Format greeting
      const greeting = selectedCustomer.title === 'Divers' 
        ? `Sehr geehrte(r) ${selectedCustomer.zusatz} ${selectedCustomer.name},`
        : `Sehr ${selectedCustomer.title === 'Herr' ? 'geehrter Herr' : 'geehrte Frau'} ${selectedCustomer.zusatz} ${selectedCustomer.name},`;

      // Format invoice items
      const formattedInvoiceItems = invoiceItems.map(item => `
        <tr>
          <td>${item.quantity}</td>
          <td>${item.description}</td>
          <td>€${item.rate.toFixed(2)}</td>
          <td>€${(item.quantity * item.rate).toFixed(2)}</td>
        </tr>
      `).join('');

      // Replace template placeholders using replaceAll()
      let filledTemplate = template
        .replaceAll('{company_name}', selectedProfile.company_name)
        .replaceAll('{company_street}', selectedProfile.company_street)
        .replaceAll('{company_postalcode}', selectedProfile.company_postalcode)
        .replaceAll('{company_city}', selectedProfile.company_city)
        .replaceAll('{tax_number}', selectedProfile.tax_number)
        .replaceAll('{tax_id}', selectedProfile.tax_id)
        .replaceAll('{customer_address}', customerAddress)
        .replaceAll('{invoice_number_date}', invoiceNumberDate)
        .replaceAll('{greeting}', greeting)
        .replaceAll('{period}', invoiceDates.hasDateRange 
          ? `${invoiceDates.startDate} bis ${invoiceDates.endDate}`
          : invoiceDates.startDate)
        .replaceAll('{invoice_items}', formattedInvoiceItems)
        .replaceAll('{total_amount}', `€${calculateTotal()}`)
        .replaceAll('{bank_institute}', selectedProfile.bank_institute)
        .replaceAll('{bank_iban}', selectedProfile.bank_iban)
        .replaceAll('{bank_bic}', selectedProfile.bank_bic)
        .replaceAll('{contact_details}', selectedProfile.contact_details || '')
        .replaceAll('{quantity_label}', 'Menge') // Replace labels
        .replaceAll('{unit_price_label}', 'Einzelpreis');
        // Add more replacements if needed

      // Generate PDF as ArrayBuffer
      const pdfBuffer = await html2pdf()
        .set({
          margin: 1,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        })
        .from(filledTemplate)
        .outputPdf('arraybuffer');

      // Construct the desired file name
      const fileName = `${selectedCustomer.name}_${currentInvoiceNumber}`;

      // Save using Electron, pass the fileName
      const saved = await window.electronAPI.saveInvoice(pdfBuffer, fileName);

      if (saved) {
        // Update invoice number in storage
        await window.electronAPI.setData('lastInvoiceNumber', currentInvoiceNumber);
        
        // Reset form
        setCurrentInvoiceNumber(generateInvoiceNumber(currentInvoiceNumber));
        setInvoiceItems([]);
        setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true });
        setShowAlert({
          show: true,
          message: 'Invoice generated and saved successfully!',
        });
      } else {
        setShowAlert({
          show: true,
          message: 'Error saving invoice. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      setShowAlert({
        show: true,
        message: 'Error generating invoice. Please try again.',
      });
    }
  };

  // Form Rendering Functions
  const renderBusinessProfileForm = (profile, setProfile) => (
    <div className="space-y-4">
      <div>
        <Label>Company Name</Label>
        <Input
          value={profile.company_name}
          onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
        />
      </div>
      <div>
        <Label>Street</Label>
        <Input
          value={profile.company_street}
          onChange={(e) => setProfile({ ...profile, company_street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Postal Code</Label>
          <Input
            value={profile.company_postalcode}
            onChange={(e) => setProfile({ ...profile, company_postalcode: e.target.value })}
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={profile.company_city}
            onChange={(e) => setProfile({ ...profile, company_city: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Tax Number</Label>
          <Input
            value={profile.tax_number}
            onChange={(e) => setProfile({ ...profile, tax_number: e.target.value })}
          />
        </div>
        <div>
          <Label>Tax ID</Label>
          <Input
            value={profile.tax_id}
            onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Bank Institute</Label>
        <Input
          value={profile.bank_institute}
          onChange={(e) => setProfile({ ...profile, bank_institute: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>IBAN</Label>
          <Input
            value={profile.bank_iban}
            onChange={(e) => setProfile({ ...profile, bank_iban: e.target.value })}
          />
        </div>
        <div>
          <Label>BIC</Label>
          <Input
            value={profile.bank_bic}
            onChange={(e) => setProfile({ ...profile, bank_bic: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

const renderCustomerForm = (customer, setCustomer) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Title</Label>
          <Select
            value={customer.title}
            onValueChange={(value) => setCustomer({ ...customer, title: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Herr">Herr</SelectItem>
              <SelectItem value="Frau">Frau</SelectItem>
              <SelectItem value="Divers">Divers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Academic Title</Label>
          <Select
            value={customer.zusatz}
            onValueChange={(value) => setCustomer({ ...customer, zusatz: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dr.">Dr.</SelectItem>
              <SelectItem value="Prof.">Prof.</SelectItem>
              <SelectItem value="Prof. Dr.">Prof. Dr.</SelectItem>
              <SelectItem value="Dr. h.c.">Dr. h.c.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Name</Label>
        <Input
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Street</Label>
        <Input
          value={customer.street}
          onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Postal Code</Label>
          <Input
            value={customer.postal_code}
            onChange={(e) => setCustomer({ ...customer, postal_code: e.target.value })}
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={customer.city}
            onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={customer.firma}
          onCheckedChange={(checked) => setCustomer({ ...customer, firma: checked })}
        />
        <Label>Business Customer</Label>
      </div>
    </div>
  );

  // Edit Functions
  const editCustomer = (updatedCustomer) => {
    const newCustomers = customers.map(c => 
      c === editingCustomer ? updatedCustomer : c
    );
    setCustomers(newCustomers);
    if (selectedCustomer === editingCustomer) {
      setSelectedCustomer(updatedCustomer);
    }
    setShowEditCustomerDialog(false);
    setEditingCustomer(null);
  };

  const editProfile = (updatedProfile) => {
    const newProfiles = businessProfiles.map(p => 
      p === editingProfile ? updatedProfile : p
    );
    setBusinessProfiles(newProfiles);
    if (selectedProfile === editingProfile) {
      setSelectedProfile(updatedProfile);
    }
    if (defaultProfileId === editingProfile.company_name) {
      setDefaultProfileId(updatedProfile.company_name);
    }
    setShowEditProfileDialog(false);
    setEditingProfile(null);
  };

  const editTag = (updatedTag) => {
    const newTags = quickTags.map((t) =>
      t === editingTag ? updatedTag : t
    );
    setQuickTags(newTags);
    setShowEditTagDialog(false);
    setEditingTag(null);
  };

  // Helper Functions
  const updateDateRangeToggle = (items) => {
    const needsDateRange = items.some(item => item.hasDateRange);
    setInvoiceDates(prev => ({
      ...prev,
      hasDateRange: needsDateRange,
      startDate: '',
      endDate: ''
    }));
  };

  const handleQuickTagClick = (tag) => {
    const newItem = {
      description: tag.description,
      quantity: parseFloat(tag.quantity),
      rate: parseFloat(tag.rate),
      total: parseFloat(tag.quantity) * parseFloat(tag.rate),
      hasDateRange: tag.hasDateRange,
    };

    const newItems = [...invoiceItems, newItem];
    setInvoiceItems(newItems);
    updateDateRangeToggle(newItems);
  };

  const validateInvoice = () => {
    if (!selectedCustomer) {
      setShowAlert({
        show: true,
        message: 'Please select a customer.',
      });
      return false;
    }

    if (!selectedProfile) {
      setShowAlert({
        show: true,
        message: 'Please select a business profile.',
      });
      return false;
    }

    if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
      setShowAlert({
        show: true,
        message: 'Please set invoice date range.',
      });
      return false;
    }

    if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
      setShowAlert({
        show: true,
        message: 'Please set invoice date.',
      });
      return false;
    }

    if (invoiceItems.length === 0) {
      setShowAlert({
        show: true,
        message: 'Please add at least one invoice item.',
      });
      return false;
    }

    return true;
  };

// Main Render
  return (
    <div className="p-4">
      {showAlert.show && (
        <Alert className="mb-4">
          <AlertDescription>{showAlert.message}</AlertDescription>
        </Alert>
      )}

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
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Customer Selection Section */}
                <div className="col-span-4 space-y-4">
                  <h3 className="text-lg font-medium">Recipient</h3>
                  <Select
                    value={selectedCustomer?.name || ''}
                    onValueChange={(value) => {
                      const customer = customers.find(c => c.name === value);
                      setSelectedCustomer(customer);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.name} value={customer.name}>
                          {customer.title === 'Divers' ? (
                            `${customer.zusatz} ${customer.name}`
                          ) : (
                            `${customer.title} ${customer.zusatz} ${customer.name}`
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedCustomer && (
                    <div className="space-y-2">
                      <Input 
                        value={selectedCustomer.street}
                        readOnly
                        className="bg-gray-50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          value={selectedCustomer.postal_code}
                          readOnly
                          className="bg-gray-50"
                        />
                        <Input 
                          value={selectedCustomer.city}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Details Section */}
                <div className="col-span-4 space-y-4">
                  <h3 className="text-lg font-medium">Invoice Details</h3>
                  <Select
                    value={selectedProfile?.company_name || ''}
                    onValueChange={(value) => {
                      const profile = businessProfiles.find(p => p.company_name === value);
                      setSelectedProfile(profile);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessProfiles.map((profile) => (
                        <SelectItem key={profile.company_name} value={profile.company_name}>
                          {profile.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label>Invoice Number</Label>
                    <Input 
                      value={currentInvoiceNumber}
                      onChange={(e) => setCurrentInvoiceNumber(e.target.value)}
                    />
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
                      <Label>{invoiceDates.hasDateRange ? 'Date Range' : 'Single Date'}</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>{invoiceDates.hasDateRange ? 'Start Date' : 'Date'}</Label>
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
                          <Label>End Date</Label>
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
                <div className="col-span-4 space-y-4">
                  <h3 className="text-lg font-medium">Quick Entry</h3>
                  <div className="flex flex-wrap gap-2">
                    {quickTags
                      .filter(tag => 
                        tag.visible && 
                        selectedProfile && 
                        tag.personas.includes(selectedProfile.company_name)
                      )
                      .map((tag, index) => (
                        <div
                          key={index}
                          onClick={() => handleQuickTagClick(tag)}
                          className="cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: tag.color || '#e2e8f0',
                            color: '#1a202c',
                          }}
                        >
                          <span>{tag.name}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoice Items Section */}
              <div className="mt-6">
                <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Rate (€)</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 mb-2">
                    <div className="col-span-6">
                      <Input
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        placeholder="Description"
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
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="Rate in €"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        value={`€${(item.quantity * item.rate).toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
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
                  Add Item
                </Button>
              </div>

              {/* Total and Generate Section */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-lg font-medium">
                  Total: €{calculateTotal()}
                </div>
                <div className="space-x-2">
                  <Button onClick={generateInvoice}>
                    <Save className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

{/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Customer Management</h2>
                <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                      <DialogDescription>
                        Enter the customer's details to add them to your list.
                      </DialogDescription>
                    </DialogHeader>
                    {renderCustomerForm(newCustomer, setNewCustomer)}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addCustomer}>Add Customer</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {customers.map((customer, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {customer.title === 'Divers' ? (
                              `${customer.zusatz} ${customer.name}`
                            ) : (
                              `${customer.title} ${customer.zusatz} ${customer.name}`
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {customer.street}, {customer.postal_code} {customer.city}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setShowEditCustomerDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updatedCustomers = customers.filter((_, i) => i !== index);
                              setCustomers(updatedCustomers);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Profiles Tab */}
        <TabsContent value="business">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-medium">Business Profiles</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const success = await window.electronAPI.exportData();
                        setShowAlert({
                          show: true,
                          message: success ? 'Data exported successfully!' : 'Failed to export data',
                        });
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const importedData = await window.electronAPI.importData();
                        if (importedData) {
                          setCustomers(importedData.customers || []);
                          setBusinessProfiles(importedData.businessProfiles || []);
                          setQuickTags(importedData.quickTags || []);
                          setCurrentInvoiceNumber(generateInvoiceNumber(importedData.lastInvoiceNumber));
                          if (importedData.defaultProfileId) {
                            setDefaultProfileId(importedData.defaultProfileId);
                            const defaultProfile = importedData.businessProfiles.find(
                              p => p.company_name === importedData.defaultProfileId
                            );
                            if (defaultProfile) setSelectedProfile(defaultProfile);
                          }
                          setShowAlert({
                            show: true,
                            message: 'Data imported successfully!',
                          });
                        } else {
                          setShowAlert({
                            show: true,
                            message: 'Failed to import data',
                          });
                        }
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
                <Dialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Business Profile</DialogTitle>
                      <DialogDescription>
                        Enter your business details to create a new profile.
                      </DialogDescription>
                    </DialogHeader>
                    {renderBusinessProfileForm(newProfile, setNewProfile)}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowNewProfileDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addBusinessProfile}>Add Profile</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {businessProfiles.map((profile, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{profile.company_name}</h3>
                          <p className="text-sm text-gray-500">
                            {profile.company_street}, {profile.company_postalcode} {profile.company_city}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex items-center mr-2">
                            <Switch
                              checked={defaultProfileId === profile.company_name}
                              onCheckedChange={(checked) => {
                                setDefaultProfileId(checked ? profile.company_name : null);
                              }}
                            />
                            <Label className="ml-2">Default</Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProfile(profile);
                              setShowEditProfileDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Quick Entry Tags</h2>
                <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Quick Entry Tag</DialogTitle>
                      <DialogDescription>
                        Create a new quick entry tag to speed up invoice creation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newTag.name}
                          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description (will show on invoice)</Label>
                        <Textarea
                          value={newTag.description}
                          onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Rate (€)</Label>
                          <Input
                            type="number"
                            value={newTag.rate}
                            onChange={(e) => setNewTag({ ...newTag, rate: e.target.value })}
                            min="0"
                            step="0.01"
                            placeholder="Price in €"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={newTag.quantity}
                            onChange={(e) => setNewTag({ ...newTag, quantity: e.target.value })}
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={newTag.color}
                          onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTag.visible}
                          onCheckedChange={(checked) => setNewTag({ ...newTag, visible: checked })}
                        />
                        <Label>Visible in Quick Entry</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTag.hasDateRange}
                          onCheckedChange={(checked) => setNewTag({ ...newTag, hasDateRange: checked })}
                        />
                        <Label>Uses Date Range</Label>
                      </div>
                      <div>
                        <Label>Associated Personas</Label>
                        <ReactSelect
                          isMulti
                          options={businessProfiles.map((profile) => ({
                            value: profile.company_name,
                            label: profile.company_name,
                          }))}
                          value={newTag.personas.map((persona) => ({
                            value: persona,
                            label: persona,
                          }))}
                          onChange={(selectedOptions) => {
                            setNewTag({
                              ...newTag,
                              personas: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setShowNewTagDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addQuickTag}>Add Tag</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {quickTags.map((tag, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 p-3 rounded"
                          style={{ backgroundColor: tag.color }}
                        >
                          <h3 className="font-medium">{tag.name}</h3>
                          <p className="text-sm text-gray-500">{tag.description}</p>
                          <div className="text-sm mt-2">
                            <p>Rate (€): €{parseFloat(tag.rate).toFixed(2)}</p>
                            <p>Quantity: {tag.quantity}</p>
                          </div>
                          <div className="text-sm mt-2">
                            <p>Associated Personas:</p>
                            <ul className="list-disc list-inside">
                              {tag.personas.map((persona) => (
                                <li key={persona}>{persona}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center mt-2">
                            <Switch
                              checked={tag.visible}
                              onCheckedChange={(checked) => {
                                const updatedTags = [...quickTags];
                                updatedTags[index].visible = checked;
                                setQuickTags(updatedTags);
                              }}
                            />
                            <Label className="ml-2">Visible in Quick Entry</Label>
                          </div>
                        </div>
                        <div className="ml-2 flex flex-col space-y-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTag(tag);
                              setShowEditTagDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updatedTags = quickTags.filter((_, i) => i !== index);
                              setQuickTags(updatedTags);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {quickTags.length === 0 && (
                <div className="text-center py-12">
                  <Tags className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Quick Tags</h3>
                  <p className="text-gray-500">
                    Create quick entry tags to speed up your invoice creation process.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <Dialog open={showEditCustomerDialog} onOpenChange={setShowEditCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && renderCustomerForm(editingCustomer, setEditingCustomer)}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setShowEditCustomerDialog(false);
              setEditingCustomer(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => editCustomer(editingCustomer)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business Profile</DialogTitle>
          </DialogHeader>
          {editingProfile && renderBusinessProfileForm(editingProfile, setEditingProfile)}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setShowEditProfileDialog(false);
              setEditingProfile(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => editProfile(editingProfile)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditTagDialog} onOpenChange={setShowEditTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quick Tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (will show on invoice)</Label>
                <Textarea
                  value={editingTag.description}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Rate (€)</Label>
                  <Input
                    type="number"
                    value={editingTag.rate}
                    onChange={(e) => setEditingTag({ ...editingTag, rate: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingTag.quantity}
                    onChange={(e) => setEditingTag({ ...editingTag, quantity: e.target.value })}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={editingTag.color}
                  onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingTag.visible}
                  onCheckedChange={(checked) => setEditingTag({ ...editingTag, visible: checked })}
                />
                <Label>Visible in Quick Entry</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingTag.hasDateRange}
                  onCheckedChange={(checked) => setEditingTag({ ...editingTag, hasDateRange: checked })}
                />
                <Label>Uses Date Range</Label>
              </div>
              <div>
                <Label>Associated Personas</Label>
                <ReactSelect
                  isMulti
                  options={businessProfiles.map((profile) => ({
                    value: profile.company_name,
                    label: profile.company_name,
                  }))}
                  value={editingTag.personas.map((persona) => ({
                    value: persona,
                    label: persona,
                  }))}
                  onChange={(selectedOptions) => {
                    setEditingTag({
                      ...editingTag,
                      personas: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                    });
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditTagDialog(false);
                    setEditingTag(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => editTag(editingTag)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlyceInvoice;