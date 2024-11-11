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
import html2pdf from 'html2pdf.js';
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
  Tags 
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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

// Add this near other constants
const PREDEFINED_COLORS = [
  { name: 'Slate', value: '#cbd5e1' },    // Slate-300
  { name: 'Gray', value: '#d1d5db' },     // Gray-300
  { name: 'Red', value: '#fca5a5' },      // Red-300
  { name: 'Orange', value: '#fdba74' },   // Orange-300
  { name: 'Amber', value: '#fcd34d' },    // Amber-300
  { name: 'Yellow', value: '#fde047' },   // Yellow-300
  { name: 'Lime', value: '#bef264' },     // Lime-300
  { name: 'Green', value: '#86efac' },    // Green-300
  { name: 'Emerald', value: '#6ee7b7' },  // Emerald-300
  { name: 'Teal', value: '#5eead4' },     // Teal-300
  { name: 'Cyan', value: '#67e8f9' },     // Cyan-300
  { name: 'Sky', value: '#7dd3fc' },      // Sky-300
  { name: 'Blue', value: '#93c5fd' },     // Blue-300
  { name: 'Indigo', value: '#a5b4fc' },   // Indigo-300
  { name: 'Violet', value: '#c4b5fd' },   // Violet-300
  { name: 'Purple', value: '#d8b4fe' },   // Purple-300
  { name: 'Fuchsia', value: '#f0abfc' },  // Fuchsia-300
  { name: 'Pink', value: '#f9a8d4' },     // Pink-300
  { name: 'Rose', value: '#fda4af' },     // Rose-300
];

// Create an object with all the icons we want to use (or just use Icons directly)
const ALL_ICONS = Object.entries(Icons).reduce((acc, [name, Icon]) => {
  // Filter out non-icon exports and ensure it's a valid component
  if (
    typeof Icon === 'function' && 
    /^[A-Z]/.test(name) && 
    name !== 'createReactComponent' && 
    name !== 'default'
  ) {
    acc[name] = Icon;
  }
  return acc;
}, {});

// Add this helper function at the top with other helper functions
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Add this helper function at the top
const formatDuration = (totalDays) => {
  const months = Math.floor(totalDays / 31);
  const days = totalDays % 31;
  const parts = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  return parts.join(' ');
};

const daysToMonthsDays = (totalDays) => ({
  months: Math.floor(totalDays / 31),
  days: totalDays % 31
});

const monthsDaysToDays = (months, days) => (months * 31) + days;

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
    color: PREDEFINED_COLORS[0].value,
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

  // Add a new state for the warning dialog
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingTag, setPendingTag] = useState(null);

  // Add new loading states
  const [isLoading, setIsLoading] = useState({
    invoice: false,
    export: false,
    import: false,
  });

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
        if (savedCustomers) {
          const customersWithIds = savedCustomers.map(customer => 
            customer.id ? customer : { ...customer, id: generateUniqueId() }
          );
          setCustomers(customersWithIds);
        }
        if (savedTags) setQuickTags(savedTags);
        if (lastInvoiceNumber) setCurrentInvoiceNumber(generateInvoiceNumber(lastInvoiceNumber));
        
        if (savedDefaultProfileId) {
          setDefaultProfileId(savedDefaultProfileId);
          const defaultProfile = savedProfiles?.find(p => p.company_name === savedDefaultProfileId);
          if (defaultProfile) {
            setSelectedProfile(defaultProfile);
          }
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
      toast.error('Please fill in all required fields.');
      return;
    }

    if (businessProfiles.length >= 20) {
      toast.error('Maximum of 20 business profiles reached.');
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
      toast.error('Please fill in all required fields.');
      return;
    }

    const customerWithId = {
      ...newCustomer,
      id: generateUniqueId(),
    };

    setCustomers([...customers, customerWithId]);
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
  };

  // Quick Tags Management
  const addQuickTag = () => {
    if (quickTags.length >= 20) {
      toast.error('Maximum of 20 quick tags reached.');
      return;
    }

    if (!selectedProfile) {
      toast.error('Please select a business profile first.');
      return;
    }

    // Check if rate or quantity is empty
    if (!newTag.rate || !newTag.quantity) {
      setPendingTag(newTag);
      setShowWarningDialog(true);
      return;
    }

    // If all fields are filled, proceed with adding the tag
    proceedWithAddingTag(newTag);
  };

  // Add a new function to handle the actual tag addition
  const proceedWithAddingTag = (tagToAdd) => {
    const tagWithPersona = {
      ...tagToAdd,
      rate: tagToAdd.rate === '' ? '0' : tagToAdd.rate,
      quantity: tagToAdd.quantity === '' ? '0' : tagToAdd.quantity,
      personas: Array.isArray(tagToAdd.personas) ? tagToAdd.personas : [],
    };

    if (!tagWithPersona.personas.includes(selectedProfile.company_name)) {
      tagWithPersona.personas = [...tagWithPersona.personas, selectedProfile.company_name];
    }

    setQuickTags([...quickTags, tagWithPersona]);
    setNewTag({
      name: '',
      description: '',
      rate: '',
      quantity: '',
      color: PREDEFINED_COLORS[0].value,
      hasDateRange: true,
      visible: true,
      personas: [],
    });
    setShowNewTagDialog(false);
    setShowWarningDialog(false);
    setPendingTag(null);
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
    if (!validateInvoice()) return;

    setIsLoading(prev => ({ ...prev, invoice: true }));
    
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
        toast.success('Invoice generated and saved successfully!');
      } else {
        toast.error('Error saving invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Error generating invoice');
    } finally {
      setIsLoading(prev => ({ ...prev, invoice: false }));
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
            <SelectTrigger className="bg-white dark:bg-slate-950">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent className="select-content">
              <SelectItem className="select-item" value="Herr">Herr</SelectItem>
              <SelectItem className="select-item" value="Frau">Frau</SelectItem>
              <SelectItem className="select-item" value="Divers">Divers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Academic Title</Label>
          <Select
            value={customer.zusatz}
            onValueChange={(value) => setCustomer({ ...customer, zusatz: value })}
          >
            <SelectTrigger className="bg-white dark:bg-slate-950">
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent className="select-content">
              <SelectItem className="select-item" value="Dr.">Dr.</SelectItem>
              <SelectItem className="select-item" value="Prof.">Prof.</SelectItem>
              <SelectItem className="select-item" value="Prof. Dr.">Prof. Dr.</SelectItem>
              <SelectItem className="select-item" value="Dr. h.c.">Dr. h.c.</SelectItem>
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
      c.id === editingCustomer.id ? updatedCustomer : c
    );
    setCustomers(newCustomers);
    if (selectedCustomer?.id === editingCustomer.id) {
      setSelectedCustomer(updatedCustomer);
    }
    setShowEditCustomerDialog(false);
    setEditingCustomer(null);
  };

  const editProfile = async (updatedProfile) => {
    const newProfiles = businessProfiles.map((profile) =>
      profile.company_name === updatedProfile.company_name ? updatedProfile : profile
    );
    
    // Update local state
    setBusinessProfiles(newProfiles);
    
    // If this is the currently selected profile, update it too
    if (selectedProfile?.company_name === updatedProfile.company_name) {
      setSelectedProfile(updatedProfile);
    }

    // Save to electron-store using the correct API method
    await window.electronAPI.setData('businessProfiles', newProfiles);
    
    setShowEditProfileDialog(false);
    setEditingProfile(null);
  };

  const editTag = (updatedTag) => {
    const newTags = quickTags.map((t) =>
      t.name === updatedTag.name ? { ...updatedTag } : t
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

    // If the tag has a duration, calculate the end date
    if (tag.duration && invoiceDates.startDate) {
      const startDate = new Date(invoiceDates.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + tag.duration - 1); // -1 to include start date

      setInvoiceDates(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }

    const newItems = [...invoiceItems, newItem];
    setInvoiceItems(newItems);
    updateDateRangeToggle(newItems);
  };

  const validateInvoice = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer.');
      return false;
    }

    if (!selectedProfile) {
      toast.error('Please select a business profile.');
      return false;
    }

    if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
      toast.error('Please set invoice date range.');
      return false;
    }

    if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
      toast.error('Please set invoice date.');
      return false;
    }

    if (invoiceItems.length === 0) {
      toast.error('Please add at least one invoice item.');
      return false;
    }

    return true;
  };

// Add this component for the color picker
const ColorPicker = ({ value, onChange }) => (
  <div className="grid grid-cols-10 gap-2">
    {PREDEFINED_COLORS.map((color) => (
      <div
        key={color.value}
        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
          value === color.value ? 'border-black' : 'border-transparent'
        }`}
        style={{ backgroundColor: color.value }}
        onClick={() => onChange(color.value)}
        title={color.name}
      />
    ))}
  </div>
);

// Update the IconPicker component
const IconPicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2">
      {Object.entries(ALL_ICONS).map(([iconName, IconComponent]) => (
        <div
          key={iconName}
          className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center justify-center ${
            value === iconName ? 'bg-gray-200' : ''
          }`}
          onClick={() => onChange(iconName)}
          title={iconName}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      ))}
    </div>
  );
};

// Main Render
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
          <Card>
            <CardContent className="p-6 min-h-[800px]">
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
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {customers.map((customer) => (
                        <SelectItem 
                          key={customer.name} 
                          value={customer.name}
                          className="hover:bg-gray-100"
                        >
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
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select business profile" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {businessProfiles.map((profile) => (
                        <SelectItem 
                          key={profile.company_name} 
                          value={profile.company_name}
                          className="hover:bg-gray-100"
                        >
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
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {quickTags
                      .filter(tag => 
                        tag.visible && 
                        selectedProfile && 
                        (tag.personas || []).includes(selectedProfile.company_name))
                      .map((tag, index) => {
                        const TagIcon = Icons[tag.icon];
                        return (
                          <div
                            key={index}
                            onClick={() => handleQuickTagClick(tag)}
                            className="cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: tag.color || '#e2e8f0',
                              color: '#1a202c',
                            }}
                          >
                            {TagIcon && <TagIcon className="w-4 h-4 mr-1" />}
                            <span>{tag.name}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Invoice Items Section */}
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
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
                </div>
              </div>

              {/* Total and Generate Section */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-lg font-medium">
                  Total: €{calculateTotal()}
                </div>
                <div className="space-x-2">
                  <Button 
                    onClick={generateInvoice} 
                    disabled={isLoading.invoice}
                    className="min-w-[200px]"
                  >
                    {isLoading.invoice ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </>
                    )}
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
                  <Card key={index} className="group relative overflow-hidden">
                    <CardContent className="p-6">
                      {/* Header with Name and Actions */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.title === 'Divers' ? (
                              `${customer.zusatz} ${customer.name}`
                            ) : (
                              `${customer.title} ${customer.zusatz} ${customer.name}`
                            )}
                          </h3>
                          {customer.firma && (
                            <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Business Customer
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setShowEditCustomerDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100"
                            onClick={() => {
                              const updatedCustomers = customers.filter((_, i) => i !== index);
                              setCustomers(updatedCustomers);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-500">Address</div>
                          <div className="text-sm text-gray-700">
                            {customer.street}
                            <br />
                            {customer.postal_code} {customer.city}
                          </div>
                        </div>

                        {/* Additional Details - can be expanded based on your needs */}
                        {customer.zusatz && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Academic Title</div>
                            <div className="text-sm text-gray-700">{customer.zusatz}</div>
                          </div>
                        )}
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
                        setIsLoading(prev => ({ ...prev, export: true }));
                        try {
                          const success = await window.electronAPI.exportData();
                          if (success) {
                            toast.success('Data exported successfully!');
                          } else {
                            toast.error('Failed to export data');
                          }
                        } catch (error) {
                          toast.error('Error exporting data');
                        } finally {
                          setIsLoading(prev => ({ ...prev, export: false }));
                        }
                      }}
                    >
                      {isLoading.export ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isLoading.export ? 'Exporting...' : 'Export Data'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setIsLoading(prev => ({ ...prev, import: true }));
                        try {
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
                            toast.success('Data imported successfully!');
                          } else {
                            toast.error('Failed to import data');
                          }
                        } catch (error) {
                          toast.error('Error importing data');
                        } finally {
                          setIsLoading(prev => ({ ...prev, import: false }));
                        }
                      }}
                    >
                      {isLoading.import ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isLoading.import ? 'Importing...' : 'Import Data'}
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
                  <Card key={index} className="group relative overflow-hidden">
                    <CardContent className="p-6">
                      {/* Header with Name and Actions */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{profile.company_name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Switch
                              checked={defaultProfileId === profile.company_name}
                              onCheckedChange={(checked) => {
                                const newDefaultId = checked ? profile.company_name : null;
                                setDefaultProfileId(newDefaultId);
                                // Automatically set the selected profile when setting default
                                if (checked) {
                                  setSelectedProfile(profile);
                                } else {
                                  setSelectedProfile(null);
                                }
                              }}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-600">Default</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={() => {
                                setEditingProfile(profile);
                                setShowEditProfileDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={() => {
                                const updatedProfiles = businessProfiles.filter((_, i) => i !== index);
                                setBusinessProfiles(updatedProfiles);
                                if (defaultProfileId === profile.company_name) {
                                  setDefaultProfileId(null);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-500">Address</div>
                          <div className="text-sm text-gray-700">
                            {profile.company_street}
                            <br />
                            {profile.company_postalcode} {profile.company_city}
                          </div>
                        </div>

                        {(profile.tax_number || profile.tax_id) && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Tax Information</div>
                            {profile.tax_number && (
                              <div className="text-sm text-gray-700">Tax Number: {profile.tax_number}</div>
                            )}
                            {profile.tax_id && (
                              <div className="text-sm text-gray-700">Tax ID: {profile.tax_id}</div>
                            )}
                          </div>
                        )}

                        {(profile.bank_institute || profile.bank_iban || profile.bank_bic) && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Banking Details</div>
                            {profile.bank_institute && (
                              <div className="text-sm text-gray-700">{profile.bank_institute}</div>
                            )}
                            {profile.bank_iban && (
                              <div className="text-sm text-gray-700">IBAN: {profile.bank_iban}</div>
                            )}
                            {profile.bank_bic && (
                              <div className="text-sm text-gray-700">BIC: {profile.bank_bic}</div>
                            )}
                          </div>
                        )}
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
                            value={newTag.rate === '' ? '' : Number(newTag.rate)}
                            onChange={(e) => setNewTag({ 
                              ...newTag, 
                              rate: e.target.value === '' ? '' : e.target.value 
                            })}
                            min="0"
                            step="0.01"
                            placeholder="Price in €"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={newTag.quantity === '' ? '' : Number(newTag.quantity)}
                            onChange={(e) => setNewTag({ 
                              ...newTag, 
                              quantity: e.target.value === '' ? '' : e.target.value 
                            })}
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <ColorPicker
                          value={newTag.color}
                          onChange={(color) => setNewTag({ ...newTag, color })}
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
                          value={(newTag.personas || []).map((persona) => ({
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
                  <div 
                    key={index} 
                    className="group relative h-[320px] overflow-hidden"
                    style={{ 
                      backgroundColor: tag.color,
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-100 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTag(tag);
                          setShowEditTagDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-100 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedTags = quickTags.filter((_, i) => i !== index);
                          setQuickTags(updatedTags);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="absolute top-2 left-2">
                      <Switch
                        checked={tag.visible}
                        onCheckedChange={(checked) => {
                          const updatedTags = [...quickTags];
                          updatedTags[index].visible = checked;
                          setQuickTags(updatedTags);
                        }}
                        className="data-[state=checked]:bg-gray-700"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 mt-8 flex flex-col h-[calc(100%-3rem)]">
                      {/* Tag Header */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-gray-700 flex-shrink-0" />
                          <h3 className="font-medium text-gray-800 truncate max-w-[180px]" title={tag.name}>
                            {tag.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description Preview */}
                      <div className="mb-4 flex-shrink-0">
                        <p className="text-sm text-gray-700 line-clamp-3" title={tag.description}>
                          {tag.description || "No description"}
                        </p>
                      </div>

                      {/* Tag Details */}
                      <div className="space-y-2 mb-3 flex-shrink-0">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span>Rate:</span>
                          <span className="font-medium">€{parseFloat(tag.rate).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span>Quantity:</span>
                          <span className="font-medium">{tag.quantity}</span>
                        </div>
                      </div>

                      {/* Associated Personas */}
                      <div className="space-y-1 mt-auto">
                        <div className="text-xs font-medium text-gray-600">Associated Personas:</div>
                        <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[60px]">
                          {tag.personas?.map((persona, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/50 truncate max-w-[120px]"
                              title={persona}
                            >
                              {persona}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {quickTags.length === 0 && (
                  <div className="col-span-4 text-center py-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                    <Tags className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Quick Tags</h3>
                    <p className="text-gray-500 mb-4">
                      Create quick entry tags to speed up your invoice creation process.
                    </p>
                    <Button onClick={() => setShowNewTagDialog(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Tag
                    </Button>
                  </div>
                )}
              </div>
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
                    value={editingTag?.rate === undefined || editingTag?.rate === '' ? '' : Number(editingTag.rate)}
                    onChange={(e) => setEditingTag({ 
                      ...editingTag, 
                      rate: e.target.value === '' ? '' : e.target.value 
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingTag?.quantity === undefined || editingTag?.quantity === '' ? '' : Number(editingTag.quantity)}
                    onChange={(e) => setEditingTag({ 
                      ...editingTag, 
                      quantity: e.target.value === '' ? '' : e.target.value 
                    })}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <ColorPicker
                  value={editingTag.color}
                  onChange={(color) => setEditingTag({ ...editingTag, color })}
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
                  value={(editingTag?.personas || []).map((persona) => ({
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

      {/* Add this dialog component near your other dialogs */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missing Values</DialogTitle>
            <DialogDescription>
              Rate or quantity is empty. Would you like to set them to 0 and continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setShowWarningDialog(false);
              setPendingTag(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => proceedWithAddingTag(pendingTag)}>
              Set to 0 and Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlyceInvoice;