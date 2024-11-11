import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import html2pdf from 'html2pdf.js';
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
  Search, 
  X,
  Building2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import SettingsTab from './tabs/SettingsTab';
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
  { name: 'Gray', value: '#E5E7EB' },
  { name: 'Light Gray', value: '#F3F4F6' },
  { name: 'Pink', value: '#FCE7F3' },
  { name: 'Orange', value: '#FDDCAB' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Light Yellow', value: '#FEF9C3' },
  { name: 'Light Green', value: '#BBF7D0' },
  { name: 'Green', value: '#86EFAC' },
  { name: 'Light Blue', value: '#BFDBFE' },
  { name: 'Blue', value: '#93C5FD' },
  { name: 'Light Purple', value: '#DDD6FE' },
  { name: 'Purple', value: '#C4B5FD' },
  { name: 'Light Pink', value: '#FBCFE8' },
  { name: 'Rose', value: '#FDA4AF' },
  { name: 'Mint', value: '#A7F3D0' },
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

// Add this helper function near other helper functions
const adjustColorForDarkMode = (hexColor, isDark) => {
  if (!isDark) return hexColor;
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Add transparency for dark mode
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
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

  // Add new state for search
  const [tagSearch, setTagSearch] = useState('');

  // Add state for search visibility
  const [showTagSearch, setShowTagSearch] = useState(false);

  // Add this to your state declarations
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

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
      <div>
        <Label>Contact Details</Label>
        <Input
          value={profile.contact_details}
          onChange={(e) => setProfile({ ...profile, contact_details: e.target.value })}
          placeholder="Phone, Email, Website, etc."
        />
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
            <SelectTrigger className="bg-background border-input">
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
            <SelectTrigger className="bg-background border-input">
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
      toast.error('Please set the complete service period (start and end date).');
      return false;
    }

    if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
      toast.error('Please set the service date.');
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
  <div className="grid grid-cols-5 gap-1">
    {PREDEFINED_COLORS.map((color) => (
      <button
        key={color.value}
        type="button"
        onClick={() => onChange(color.value)}
        className={`w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110 ${
          value === color.value ? 'ring-1 ring-primary ring-offset-1' : ''
        }`}
        style={{ backgroundColor: color.value }}
        title={color.name}
      />
    ))}
  </div>
);

// Update the dialog trigger for editing
const handleTagDialog = (existingTag = null) => {
  if (existingTag) {
    setNewTag(existingTag);
  } else {
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
  }
  setShowNewTagDialog(true);
};

// Update the handlers for business profiles
const handleProfileDialog = (existingProfile = null) => {
  if (existingProfile) {
    setNewProfile(existingProfile);
  } else {
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
  }
  setShowNewProfileDialog(true);
};

// Update the handler for customers
const handleCustomerDialog = (existingCustomer = null) => {
  if (existingCustomer) {
    setNewCustomer(existingCustomer);
  } else {
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
  setShowNewCustomerDialog(true);
};

// Add this useEffect to listen for theme changes
useEffect(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  return () => observer.disconnect();
}, []);

// Add this to your existing useEffect hooks
useEffect(() => {
  const handleDataImport = (event) => {
    const importedData = event.detail;
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
  };

  window.addEventListener('dataImported', handleDataImport);
  return () => window.removeEventListener('dataImported', handleDataImport);
}, []);

// Main Render
  return (
    <div className="container-large space-y-6">
      <Toaster position="top-right" expand={true} richColors />

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="invoice" className="data-[state=active]:bg-background">
            <FileText className="w-4 h-4 mr-2" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-background">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-background">
            <Building2 className="w-4 h-4 mr-2" />
            Business Profiles
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-background">
            <Tags className="w-4 h-4 mr-2" />
            Quick Tags
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <Card className="border-border">
            <CardContent className="responsive-p space-y-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Customer Selection Section */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Recipient</h3>
                  <Select
                    value={selectedCustomer?.name || ''}
                    onValueChange={(value) => {
                      const customer = customers.find(c => c.name === value);
                      setSelectedCustomer(customer);
                    }}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="select-content">
                      {customers.map((customer) => (
                        <SelectItem 
                          key={customer.name} 
                          value={customer.name}
                          className="select-item"
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
                  <h3 className="text-lg font-medium">Invoice Details</h3>
                  <Select
                    value={selectedProfile?.company_name || ''}
                    onValueChange={(value) => {
                      const profile = businessProfiles.find(p => p.company_name === value);
                      setSelectedProfile(profile);
                    }}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select business profile" />
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
                    <Label>Invoice Number</Label>
                    <Input 
                      value={currentInvoiceNumber}
                      onChange={(e) => setCurrentInvoiceNumber(e.target.value)}
                      className="bg-background border-input"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auto-generated but can be modified if needed
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
                      <Label>{invoiceDates.hasDateRange ? 'Service Period (Range)' : 'Service Date'}</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>{invoiceDates.hasDateRange ? 'Start of Service' : 'Service Date'}</Label>
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
                          <Label>End of Service</Label>
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
                            // Optional: Auto-focus when search bar appears
                            autoFocus
                            // Optional: Close search on Escape key
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
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 pb-12">
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
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Invoice Items Section */}
              <div className="mt-6">
                <div className="overflow-x-auto rounded-md border border-border">
                  <div className="min-w-[600px] p-0.5">
                    <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-foreground">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Rate (€)</div>
                      <div className="col-span-1">Total</div>
                      <div className="col-span-1"></div>
                    </div>

                    {invoiceItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2 mx-0.5">
                        <div className="col-span-6">
                          <Input
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-background border-input"
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
                            className="bg-background border-input"
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
          <Card className="border-border">
            <CardContent className="responsive-p">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground">Customer Management</h2>
                <Dialog open={showNewCustomerDialog} onOpenChange={(open) => {
                  if (!open) {
                    // Reset state when dialog closes
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
                      Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{newCustomer.id ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                      <DialogDescription>
                        {newCustomer.id ? 'Edit the customer\'s details.' : 'Enter the customer\'s details to add them to your list.'}
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
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        if (newCustomer.id && customers.find(c => c.id === newCustomer.id)) {
                          // Handle edit case
                          const updatedCustomers = customers.map(c => 
                            c.id === newCustomer.id ? newCustomer : c
                          );
                          setCustomers(updatedCustomers);
                          if (selectedCustomer?.id === newCustomer.id) {
                            setSelectedCustomer(newCustomer);
                          }
                        } else {
                          // Handle add case
                          addCustomer();
                        }
                        // Clear the state after saving
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
                        {newCustomer.id ? 'Save Changes' : 'Add Customer'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="responsive-grid responsive-gap">
                {customers.map((customer, index) => (
                  <Card key={index} className="group relative overflow-hidden border-border">
                    <CardContent className="responsive-p">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold text-foreground">
                            {customer.title} {customer.name}
                          </h3>
                          {customer.zusatz && (
                            <span className="text-sm text-muted-foreground">
                              {customer.zusatz}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {customer.firma && (
                            <Icons.Building2 className="h-4 w-4 text-primary" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-secondary"
                            onClick={() => handleCustomerDialog(customer)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-secondary"
                            onClick={() => {
                              const updatedCustomers = customers.filter((_, i) => i !== index);
                              setCustomers(updatedCustomers);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">Address</div>
                          <div className="text-sm text-foreground">
                            {customer.street}
                            <br />
                            {customer.postal_code} {customer.city}
                          </div>
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
            <CardContent className="responsive-p">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground">Business Profiles</h2>
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
                    });
                  }
                  setShowNewProfileDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{newProfile.company_name ? 'Edit Business Profile' : 'Add New Business Profile'}</DialogTitle>
                      <DialogDescription>
                        {newProfile.company_name ? 'Edit your business profile details.' : 'Enter your business profile details below.'}
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
                          });
                          setShowNewProfileDialog(false);
                        }}
                      >
                        Cancel
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
                        });
                        setShowNewProfileDialog(false);
                      }}>
                        {newProfile.company_name ? 'Save Changes' : 'Add Profile'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Profiles Grid */}
              <div className="responsive-grid responsive-gap">
                {businessProfiles.map((profile, index) => (
                  <Card key={index} className="group relative overflow-hidden border-border">
                    <CardContent className="responsive-p">
                      {/* Profile Header */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {profile.company_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
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
                            <span className="ml-2 text-sm text-muted-foreground">Default</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-secondary"
                              onClick={() => handleProfileDialog(profile)}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-secondary"
                              onClick={() => {
                                const updatedProfiles = businessProfiles.filter((_, i) => i !== index);
                                setBusinessProfiles(updatedProfiles);
                                if (defaultProfileId === profile.company_name) {
                                  setDefaultProfileId(null);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">Address</div>
                          <div className="text-sm text-foreground">
                            {profile.company_street}
                            <br />
                            {profile.company_postalcode} {profile.company_city}
                          </div>
                        </div>

                        {(profile.tax_number || profile.tax_id) && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">Tax Information</div>
                            {profile.tax_number && (
                              <div className="text-sm text-foreground">Tax Number: {profile.tax_number}</div>
                            )}
                            {profile.tax_id && (
                              <div className="text-sm text-foreground">Tax ID: {profile.tax_id}</div>
                            )}
                          </div>
                        )}

                        {(profile.bank_institute || profile.bank_iban || profile.bank_bic) && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">Banking Details</div>
                            {profile.bank_institute && (
                              <div className="text-sm text-foreground">{profile.bank_institute}</div>
                            )}
                            {profile.bank_iban && (
                              <div className="text-sm text-foreground">IBAN: {profile.bank_iban}</div>
                            )}
                            {profile.bank_bic && (
                              <div className="text-sm text-foreground">BIC: {profile.bank_bic}</div>
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
            <CardContent className="responsive-p">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground">Quick Entry Tags</h2>
                <Dialog open={showNewTagDialog} onOpenChange={(open) => {
                  if (!open) {
                    // Reset state when dialog closes
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
                  }
                  setShowNewTagDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dialog-content sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{newTag.name ? 'Edit Quick Tag' : 'Add New Quick Tag'}</DialogTitle>
                      <DialogDescription>
                        {newTag.name ? 'Edit your quick entry tag details.' : 'Create a new quick entry tag for faster invoice creation.'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="dialog-section">
                      <div className="form-field">
                        <Label>Name</Label>
                        <Input
                          value={newTag.name}
                          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        />
                      </div>

                      <div className="form-field">
                        <Label>Description</Label>
                        <Input
                          value={newTag.description}
                          onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-field">
                          <Label>Rate (€)</Label>
                          <Input
                            type="number"
                            value={newTag.rate}
                            onChange={(e) => setNewTag({ ...newTag, rate: e.target.value })}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="form-field">
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

                      <div className="form-field">
                        <Label>Color</Label>
                        <div className="color-picker-grid">
                          {PREDEFINED_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setNewTag({ ...newTag, color: color.value })}
                              className="color-picker-item"
                              data-selected={newTag.color === color.value}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="switch-container">
                        <Switch
                          checked={newTag.visible}
                          onCheckedChange={(checked) => setNewTag({ ...newTag, visible: checked })}
                        />
                        <Label>Visible in Quick Entry</Label>
                      </div>

                      <div className="switch-container">
                        <Switch
                          checked={newTag.hasDateRange}
                          onCheckedChange={(checked) => setNewTag({ ...newTag, hasDateRange: checked })}
                        />
                        <Label>Uses Date Range</Label>
                      </div>

                      <div className="form-field">
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
                          classNamePrefix="select"
                          className="select-container"
                          unstyled
                          styles={{
                            input: (base) => ({
                              ...base,
                              color: 'inherit'
                            })
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => {
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
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        if (newTag.name && quickTags.find(t => t.name === newTag.name)) {
                          // Handle edit case
                          const updatedTags = quickTags.map(t => 
                            t.name === newTag.name ? newTag : t
                          );
                          setQuickTags(updatedTags);
                        } else {
                          // Handle add case
                          addQuickTag();
                        }
                        // Clear the state after saving
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
                      }}>
                        {newTag.name ? 'Save Changes' : 'Add Tag'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="responsive-grid responsive-gap">
                {quickTags.map((tag, index) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-border transition-all hover:shadow-md dark:bg-opacity-20"
                    style={{ 
                      backgroundColor: adjustColorForDarkMode(tag.color || '#f3f4f6', isDarkMode),
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                        onClick={() => handleTagDialog(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                        onClick={() => {
                          const updatedTags = quickTags.filter((_, i) => i !== index);
                          setQuickTags(updatedTags);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="absolute top-3 left-3 z-10">
                      <Switch
                        checked={tag.visible}
                        onCheckedChange={(checked) => {
                          const updatedTags = [...quickTags];
                          updatedTags[index].visible = checked;
                          setQuickTags(updatedTags);
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <CardContent className="p-6 mt-8">
                      {/* Tag Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <Tags className="h-5 w-5 text-foreground/70" />
                          <h3 className="font-semibold text-lg text-foreground/90 truncate" title={tag.name}>
                            {tag.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <p className="text-sm text-foreground/70 line-clamp-2" title={tag.description}>
                          {tag.description || "No description provided"}
                        </p>
                      </div>

                      {/* Tag Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between bg-background/40 dark:bg-background/10 rounded-md p-2">
                          <span className="text-sm text-foreground/70">Rate:</span>
                          <span className="font-medium text-foreground">€{parseFloat(tag.rate).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between bg-background/40 dark:bg-background/10 rounded-md p-2">
                          <span className="text-sm text-foreground/70">Quantity:</span>
                          <span className="font-medium text-foreground">{tag.quantity}</span>
                        </div>
                      </div>

                      {/* Associated Personas */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground/70">Associated Personas:</div>
                        <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto">
                          {tag.personas?.map((persona, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background/60 dark:bg-background/20 backdrop-blur-sm text-foreground/80 hover:bg-background/80 dark:hover:bg-background/30 transition-colors"
                              title={persona}
                            >
                              {persona}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Empty State */}
                {quickTags.length === 0 && (
                  <div className="col-span-4 text-center py-12 bg-secondary/50 rounded-lg border-2 border-dashed border-border">
                    <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Quick Tags</h3>
                    <p className="text-muted-foreground mb-4">
                      Create quick entry tags to speed up your invoice creation process.
                    </p>
                    <Button 
                      onClick={() => setShowNewTagDialog(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Tag
                    </Button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              {showTagSearch && (
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-[200px] pl-8 bg-background border-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowTagSearch(false);
                        setTagSearch('');
                      }
                    }}
                  />
                  <Search className="w-4 h-4 absolute left-2.5 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-1 hover:bg-secondary"
                    onClick={() => {
                      setShowTagSearch(false);
                      setTagSearch('');
                    }}
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>

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