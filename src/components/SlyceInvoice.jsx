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
  FileText, 
  Users, 
  Settings, 
  Tags, 
  Building2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import SettingsTab from './tabs/SettingsTab';
import { PDFObject } from 'react-pdfobject';
import { useTranslation } from 'react-i18next';
import BusinessTab from './tabs/BusinessTab';
import CustomersTab from './tabs/CustomersTab';
import InvoiceTab from './tabs/InvoiceTab';
import TagsTab from './tabs/TagsTab';
// Helper Functions
const generateInvoiceNumber = (lastNumber, profileId, forceGenerate = false) => {
  if (lastNumber && !forceGenerate && !lastNumber.includes('_')) {
    return lastNumber;
  }

  if (!profileId) {
    console.warn('No profile ID provided for invoice number generation');
    return '';
  }

  const year = new Date().getFullYear();
  const currentYearPrefix = `${year}_${profileId}_`;
  
  if (forceGenerate && lastNumber && lastNumber.startsWith(currentYearPrefix)) {
    const sequence = parseInt(lastNumber.split('_')[2]) + 1;
    return `${currentYearPrefix}${sequence.toString().padStart(5, '0')}`;
  }
  
  if (!lastNumber || !lastNumber.startsWith(currentYearPrefix)) {
    return `${currentYearPrefix}00001`;
  }

  return lastNumber;
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
  { name: 'Gray', value: '#D1D5DB' },
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

// Add this helper function
const formatInvoiceItems = (items) => {
  return items.map(item => `
    <tr>
      <td>${item.quantity}</td>
      <td>${item.description}</td>
      <td>€${item.rate.toFixed(2)}</td>
      <td>€${(item.quantity * item.rate).toFixed(2)}</td>
    </tr>
  `).join('');
};

// Add this new component near your other components
const InvoiceTotals = ({ items, profile }) => {
  const { t } = useTranslation();
  const netTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vatRate = profile?.vat_enabled ? (profile.vat_rate || 19) : 0;
  const vatAmount = profile?.vat_enabled ? (netTotal * (vatRate / 100)) : 0;
  const totalAmount = netTotal + vatAmount;

  return (
    <div className="mt-6 space-y-2 w-[300px] ml-auto">
      <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
        <span className="text-sm text-muted-foreground">{t('invoice.totals.netAmount')}:</span>
        <span className="font-medium">€{netTotal.toFixed(2)}</span>
      </div>
      
      {profile?.vat_enabled && (
        <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {t('invoice.totals.vat', { rate: vatRate })}:
          </span>
          <span className="font-medium">€{vatAmount.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center p-2 bg-primary/10 rounded-md font-medium">
        <span className="text-sm">{t('invoice.totals.totalAmount')}:</span>
        <span>€{totalAmount.toFixed(2)}</span>
      </div>

      <div className="text-xs text-muted-foreground italic mt-2">
        {profile?.vat_enabled 
          ? t('invoice.totals.vatNotice.enabled')
          : t('invoice.totals.vatNotice.disabled')}
      </div>
    </div>
  );
};

const SlyceInvoice = () => {
  const { t } = useTranslation();

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
    vat_enabled: false,
    vat_rate: 19,
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

  // Add new state for PDF preview
  const [pdfPreview, setPdfPreview] = useState({
    show: false,
    data: null,
    fileName: ''
  });

  // Add this to your state declarations
  const [previewSettings, setPreviewSettings] = React.useState({
    showPreview: true
  });

  // Add new state for profile-specific invoice numbers
  const [profileInvoiceNumbers, setProfileInvoiceNumbers] = useState({});

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedProfiles = await window.electronAPI.getData('businessProfiles');
        const savedCustomers = await window.electronAPI.getData('customers');
        const savedTags = await window.electronAPI.getData('quickTags');
        const savedInvoiceNumbers = await window.electronAPI.getData('profileInvoiceNumbers') || {};

        if (savedProfiles) setBusinessProfiles(savedProfiles);
        if (savedCustomers) {
          const customersWithIds = savedCustomers.map(customer => 
            customer.id ? customer : { ...customer, id: generateUniqueId() }
          );
          setCustomers(customersWithIds);
        }
        if (savedTags) setQuickTags(savedTags);
        if (savedInvoiceNumbers) setProfileInvoiceNumbers(savedInvoiceNumbers);
        
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
        await window.electronAPI.setData('profileInvoiceNumbers', profileInvoiceNumbers);
        if (defaultProfileId) {
          await window.electronAPI.setData('defaultProfileId', defaultProfileId);
        }
      };
      saveData();
    }
  }, [businessProfiles, customers, quickTags, defaultProfileId, profileInvoiceNumbers, isInitialized]);

  // Business Profile Management
  const addBusinessProfile = () => {
    if (!validateBusinessProfile(newProfile)) {
      toast.error(t('messages.error.required'));
      return;
    }

    if (businessProfiles.length >= 20) {
      toast.error(t('messages.error.maxProfiles'));
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
      vat_enabled: false,
      vat_rate: 19,
    });
    setShowNewProfileDialog(false);
  };

  // Customer Management
  const addCustomer = () => {
    if (!validateCustomer(newCustomer)) {
      toast.error(t('messages.error.required'));
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
    if (field === 'quantity' || field === 'rate') {
      // Ensure these are numbers
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    newItems[index].total = newItems[index].quantity * newItems[index].rate;
    setInvoiceItems(newItems);
  };

  const deleteInvoiceItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
    updateDateRangeToggle(newItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const generateInvoice = async () => {
    if (!validateInvoice()) return;

    setIsLoading(prev => ({ ...prev, invoice: true }));
    
    try {
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

      // Calculate amounts
      const netTotal = calculateTotal();
      const vatRate = selectedProfile.vat_enabled ? (selectedProfile.vat_rate || 19) : 0;
      const vatAmount = selectedProfile.vat_enabled ? (netTotal * (vatRate / 100)) : 0;
      const totalAmount = netTotal + vatAmount;

      // Create VAT row HTML if VAT is enabled
      const vatRowHtml = selectedProfile.vat_enabled 
        ? `<tr>
            <td>Mehrwertsteuer (${vatRate}%):</td>
            <td>€${vatAmount.toFixed(2)}</td>
          </tr>`
        : '';

      // Create VAT notice based on profile settings
      const vatNoticeHtml = selectedProfile.vat_enabled
        ? `<p class="vat-notice">Umsatzsteuer wird gemäß § 19 UStG berechnet.</p>`
        : `<p class="vat-notice">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>`;

      // Format invoice items
      const formattedInvoiceItems = formatInvoiceItems(invoiceItems);

      // Replace template placeholders
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
        .replaceAll('{net_amount}', `€${netTotal.toFixed(2)}`)
        .replaceAll('{vat_row}', vatRowHtml)
        .replaceAll('{vat_notice}', vatNoticeHtml)
        .replaceAll('{total_amount}', `€${totalAmount.toFixed(2)}`)
        .replaceAll('{bank_institute}', selectedProfile.bank_institute)
        .replaceAll('{bank_iban}', selectedProfile.bank_iban)
        .replaceAll('{bank_bic}', selectedProfile.bank_bic)
        .replaceAll('{contact_details}', selectedProfile.contact_details || '')
        .replaceAll('{quantity_label}', 'Menge') // Replace labels
        .replaceAll('{unit_price_label}', 'Einzelpreis');
        // Add more replacements if needed

      // Remove the static page number from the template
      filledTemplate = filledTemplate.replace(
        '<div class="page-number">1/1</div>',
        '<div class="page-number" id="page-counter"></div>'
      );

      // Generate PDF with page numbers
      const pdf = await html2pdf().set({
        margin: 1,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', before: '.page-break' },
        footer: {
          height: '20px',
          contents: {
            default: '<div style="text-align: center; font-size: 10px; font-family: Inter, sans-serif;" class="page-number">{{page}}/{{pages}}</div>'
          }
        }
      })
      .from(filledTemplate)
      .outputPdf('arraybuffer');

      // Create Blob for preview
      const pdfBlob = new Blob([pdf], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Construct the desired file name
      const fileName = `${selectedCustomer.name}_${currentInvoiceNumber}`;

      // Save using Electron
      const saved = await window.electronAPI.saveInvoice(pdf, fileName);

      if (saved) {
        // Add an artificial delay before hiding the loading overlay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (previewSettings.showPreview) {
          setPdfPreview({
            show: true,
            data: pdfUrl,
            fileName: fileName
          });
        } else {
          // Only show success toast if preview is not active
          toast.success(t('messages.success.invoiceGenerated'));
          
          // Generate next number for this profile
          const nextNumber = generateInvoiceNumber(
            currentInvoiceNumber, 
            selectedProfile.company_name, 
            true
          );
          setCurrentInvoiceNumber(nextNumber);
          setInvoiceItems([]);
          setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true });
        }

        // Save the current invoice number for this profile
        const updatedNumbers = {
          ...profileInvoiceNumbers,
          [selectedProfile.company_name]: currentInvoiceNumber
        };
        setProfileInvoiceNumbers(updatedNumbers);
        await window.electronAPI.setData('profileInvoiceNumbers', updatedNumbers);

      } else {
        toast.error(t('messages.error.savingInvoice'));
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(t('messages.error.generatingInvoice'));
    } finally {
      setIsLoading(prev => ({ ...prev, invoice: false }));
    }
  };

  // Form Rendering Functions
  const renderBusinessProfileForm = (profile, setProfile) => {
    const { t } = useTranslation();
    return (
      <div className="space-y-4">
        <div>
          <Label>{t('business.form.companyName')}</Label>
          <Input
            value={profile.company_name}
            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
          />
        </div>
        <div>
          <Label>{t('business.form.street')}</Label>
          <Input
            value={profile.company_street}
            onChange={(e) => setProfile({ ...profile, company_street: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('business.form.postalCode')}</Label>
            <Input
              value={profile.company_postalcode}
              onChange={(e) => setProfile({ ...profile, company_postalcode: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('business.form.city')}</Label>
            <Input
              value={profile.company_city}
              onChange={(e) => setProfile({ ...profile, company_city: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('business.form.taxNumber')}</Label>
            <Input
              value={profile.tax_number}
              onChange={(e) => setProfile({ ...profile, tax_number: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('business.form.taxId')}</Label>
            <Input
              value={profile.tax_id}
              onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>{t('business.form.bankInstitute')}</Label>
          <Input
            value={profile.bank_institute}
            onChange={(e) => setProfile({ ...profile, bank_institute: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('business.form.iban')}</Label>
            <Input
              value={profile.bank_iban}
              onChange={(e) => setProfile({ ...profile, bank_iban: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('business.form.bic')}</Label>
            <Input
              value={profile.bank_bic}
              onChange={(e) => setProfile({ ...profile, bank_bic: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>{t('business.form.contactDetails')}</Label>
          <Input
            value={profile.contact_details}
            onChange={(e) => setProfile({ ...profile, contact_details: e.target.value })}
            placeholder={t('business.form.contactDetailsPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={profile.vat_enabled}
              onCheckedChange={(checked) => setProfile({ 
                ...profile, 
                vat_enabled: checked,
                vat_rate: checked ? (profile.vat_rate || 19) : 0
              })}
            />
            <Label>{t('business.form.vatEnabled')}</Label>
          </div>
          
          {profile.vat_enabled && (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={profile.vat_rate || 19}
                onChange={(e) => setProfile({ 
                  ...profile, 
                  vat_rate: parseFloat(e.target.value) 
                })}
                min="0"
                max="100"
                step="0.1"
                className="w-20"
              />
              <Label>{t('business.form.vatRate')}</Label>
            </div>
          )}
        </div>
      </div>
    );
  };

const renderCustomerForm = (customer, setCustomer) => {
    const { t } = useTranslation();
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('customers.form.title')}</Label>
            <Select
              value={customer.title}
              onValueChange={(value) => setCustomer({ ...customer, title: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('customers.form.selectTitle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Herr">{t('customers.form.titles.mr')}</SelectItem>
                <SelectItem value="Frau">{t('customers.form.titles.mrs')}</SelectItem>
                <SelectItem value="Divers">{t('customers.form.titles.diverse')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('customers.form.academicTitle.label')}</Label>
            <Select
              value={customer.zusatz}
              onValueChange={(value) => setCustomer({ ...customer, zusatz: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('customers.form.academicTitle.placeholder')} />
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
          <Label>{t('customers.form.name')}</Label>
          <Input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
        </div>
        <div>
          <Label>{t('customers.form.street')}</Label>
          <Input
            value={customer.street}
            onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('customers.form.postalCode')}</Label>
            <Input
              value={customer.postal_code}
              onChange={(e) => setCustomer({ ...customer, postal_code: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('customers.form.city')}</Label>
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
          <Label>{t('customers.form.businessCustomer')}</Label>
        </div>
      </div>
    );
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
      toast.error(t('messages.validation.selectCustomer'));
      return false;
    }

    if (!selectedProfile) {
      toast.error(t('messages.validation.selectProfile'));
      return false;
    }

    if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
      toast.error(t('messages.validation.setServicePeriod'));
      return false;
    }

    if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
      toast.error(t('messages.validation.setServiceDate'));
      return false;
    }

    if (invoiceItems.length === 0) {
      toast.error(t('messages.validation.addItem'));
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
      vat_enabled: false,
      vat_rate: 19,
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

// Add this useEffect to load preview settings
useEffect(() => {
  const loadPreviewSettings = async () => {
    const settings = await window.electronAPI.getData('previewSettings');
    if (settings) {
      setPreviewSettings(settings);
    }
  };
  loadPreviewSettings();

  // Listen for settings changes
  const handleSettingsChange = (event) => {
    setPreviewSettings(event.detail);
  };
  window.addEventListener('previewSettingsChanged', handleSettingsChange);
  
  return () => {
    window.removeEventListener('previewSettingsChanged', handleSettingsChange);
  };
}, []);

// Add this near your other dialogs
const PreviewDialog = () => (
  <Dialog 
    open={pdfPreview.show} 
    onOpenChange={(open) => {
      if (!open) {
        URL.revokeObjectURL(pdfPreview.data);
        setPdfPreview({ show: false, data: null, fileName: '' });
        // Reset form after closing preview, but keep the invoice number
        setInvoiceItems([]);
        setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true });
        // Generate next invoice number
        if (selectedProfile) {
          const nextNumber = generateInvoiceNumber(
            currentInvoiceNumber, 
            selectedProfile.company_name, 
            true
          );
          setCurrentInvoiceNumber(nextNumber);
          // Update stored numbers
          const updatedNumbers = {
            ...profileInvoiceNumbers,
            [selectedProfile.company_name]: nextNumber
          };
          setProfileInvoiceNumbers(updatedNumbers);
          window.electronAPI.setData('profileInvoiceNumbers', updatedNumbers).catch(error => {
            console.error('Error saving invoice number:', error);
          });
        }
      }
    }}
  >
    <DialogContent className="pdf-preview-content">
      <DialogHeader>
        <DialogTitle>{t('invoice.actions.preview')} - {pdfPreview.fileName}</DialogTitle>
      </DialogHeader>
      <div className="pdf-container">
        <iframe
          src={pdfPreview.data}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="PDF Preview"
        />
      </div>
    </DialogContent>
  </Dialog>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-lg font-medium text-foreground">{t('invoice.actions.generating')}</p>
    </div>
  </div>
);

// Add these new helper functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const getTagBackground = (() => {
  const cache = new Map();
  
  return (color, isDark) => {
    const key = `${color}-${isDark}`;
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    let result;
    if (isDark) {
      const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      if (rgb) {
        const r = parseInt(rgb[1], 16);
        const g = parseInt(rgb[2], 16);
        const b = parseInt(rgb[3], 16);
        result = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(${r}, ${g}, ${b}, 0.05) 100%)`;
      }
    } else {
      result = `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`;
    }
    
    cache.set(key, result);
    return result;
  };
})();

// Add effect to initialize/update invoice number when profile changes
useEffect(() => {
  if (selectedProfile) {
    const profileId = selectedProfile.company_name;
    const lastNumber = profileInvoiceNumbers[profileId];
    // Only generate a new number if we don't have one for this profile
    if (!lastNumber) {
      const newNumber = generateInvoiceNumber(lastNumber, profileId);
      if (newNumber) {
        setCurrentInvoiceNumber(newNumber);
      }
    } else {
      // Use the stored number for this profile
      setCurrentInvoiceNumber(lastNumber);
    }
  } else {
    setCurrentInvoiceNumber('');
  }
}, [selectedProfile]);

// Add effect to handle default profile
useEffect(() => {
  const loadDefaultProfile = async () => {
    try {
      const savedDefaultId = await window.electronAPI.getData('defaultProfileId');
      if (savedDefaultId && businessProfiles.length > 0) {
        const defaultProfile = businessProfiles.find(p => p.company_name === savedDefaultId);
        if (defaultProfile) {
          setDefaultProfileId(savedDefaultId);
          setSelectedProfile(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Error loading default profile:', error);
    }
  };

  if (isInitialized && businessProfiles.length > 0) {
    loadDefaultProfile();
  }
}, [isInitialized, businessProfiles]);

// Main Render
  return (
    <div className="container-large space-y-6">
      <Toaster position="top-right" expand={true} richColors />
      {isLoading.invoice && <LoadingOverlay />}

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="invoice" className="data-[state=active]:bg-background">
            <FileText className="w-4 h-4 mr-2" />
            {t('invoice.title')}
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-background">
            <Users className="w-4 h-4 mr-2" />
            {t('customers.title')}
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-background">
            <Building2 className="w-4 h-4 mr-2" />
            {t('business.title')}
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-background">
            <Tags className="w-4 h-4 mr-2" />
            {t('tags.title')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background">
            <Settings className="w-4 h-4 mr-2" />
            {t('settings.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <InvoiceTab 
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            businessProfiles={businessProfiles}
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
            currentInvoiceNumber={currentInvoiceNumber}
            setCurrentInvoiceNumber={setCurrentInvoiceNumber}
            invoiceDates={invoiceDates}
            setInvoiceDates={setInvoiceDates}
            showTagSearch={showTagSearch}
            setShowTagSearch={setShowTagSearch}
            tagSearch={tagSearch}
            setTagSearch={setTagSearch}
            quickTags={quickTags}
            handleQuickTagClick={handleQuickTagClick}
            isDarkMode={isDarkMode}
            adjustColorForDarkMode={adjustColorForDarkMode}
            Icons={Icons}
            invoiceItems={invoiceItems}
            updateInvoiceItem={updateInvoiceItem}
            deleteInvoiceItem={deleteInvoiceItem}
            addInvoiceItem={addInvoiceItem}
            generateInvoice={generateInvoice}
            isLoading={isLoading}
            profileInvoiceNumbers={profileInvoiceNumbers}
            setProfileInvoiceNumbers={setProfileInvoiceNumbers}
          />
        </TabsContent>

        {/* Quick Tags Tab */}
        <TabsContent value="tags">
          <TagsTab 
            quickTags={quickTags}
            setQuickTags={setQuickTags}
            newTag={newTag}
            setNewTag={setNewTag}
            showNewTagDialog={showNewTagDialog}
            setShowNewTagDialog={setShowNewTagDialog}
            businessProfiles={businessProfiles}
            handleTagDialog={handleTagDialog}
            addQuickTag={addQuickTag}
            isDarkMode={isDarkMode}
            getTagBackground={getTagBackground}
            PREDEFINED_COLORS={PREDEFINED_COLORS}
          />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <CustomersTab 
            customers={customers}
            setCustomers={setCustomers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            newCustomer={newCustomer}
            setNewCustomer={setNewCustomer}
            showNewCustomerDialog={showNewCustomerDialog}
            setShowNewCustomerDialog={setShowNewCustomerDialog}
            renderCustomerForm={renderCustomerForm}
            handleCustomerDialog={handleCustomerDialog}
            addCustomer={addCustomer}
          />
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <BusinessTab 
            businessProfiles={businessProfiles}
            setBusinessProfiles={setBusinessProfiles}
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
            defaultProfileId={defaultProfileId}
            setDefaultProfileId={setDefaultProfileId}
            newProfile={newProfile}
            setNewProfile={setNewProfile}
            showNewProfileDialog={showNewProfileDialog}
            setShowNewProfileDialog={setShowNewProfileDialog}
            renderBusinessProfileForm={renderBusinessProfileForm}
            handleProfileDialog={handleProfileDialog}
          />
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

      {/* Add these dialogs at the bottom */}
      <PreviewDialog />
    </div>
  );
};

export default SlyceInvoice;