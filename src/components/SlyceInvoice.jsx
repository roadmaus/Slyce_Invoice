import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import * as Icons from 'lucide-react';
import { 
  FileText, 
  Users, 
  Settings, 
  Tags, 
  Building2
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import SettingsTab from './tabs/SettingsTab';
import { useTranslation } from 'react-i18next';
import BusinessTab from './tabs/BusinessTab';
import CustomersTab from './tabs/CustomersTab';
import InvoiceTab from './tabs/InvoiceTab';
import TagsTab from './tabs/TagsTab';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { TITLE_KEYS, ACADEMIC_TITLE_KEYS, TITLE_STORAGE_VALUES, ACADEMIC_STORAGE_VALUES } from '@/constants/titleMappings';
import LoadingOverlay from './LoadingOverlay';
import InvoicePreviewDialog from './InvoicePreviewDialog';
import { api } from '@/lib/api';
import { generateInvoicePdf, saveInvoicePdf } from '@/lib/invoiceGenerator';

const generateInvoiceNumber = (lastNumber, profileId, forceGenerate = false) => {
  if (!profileId) {
    console.warn('No profile ID provided for invoice number generation');
    return '';
  }

  const currentYear = new Date().getFullYear();
  
  // If we have a last number and it's not forced, return it
  if (lastNumber && !forceGenerate) {
    // Check if it's a manually entered number (doesn't contain underscores)
    if (!lastNumber.includes('_')) {
      return lastNumber;
    }
    
    // Check if it's from the current year
    const [year] = lastNumber.split('_');
    if (parseInt(year) === currentYear) {
      return lastNumber;
    }
  }

  // If we have a last number and we're forcing a new one
  if (lastNumber && forceGenerate) {
    // If it's a manually entered number, start new sequence
    if (!lastNumber.includes('_')) {
      return `${currentYear}_${profileId}_00001`;
    }
    
    const [year, customId, sequence] = lastNumber.split('_');
    
    // If it's from a different year, start new sequence
    if (parseInt(year) !== currentYear) {
      return `${currentYear}_${customId}_00001`;
    }
    
    // Use the custom ID from the last number instead of the profile ID
    const nextSequence = (parseInt(sequence) + 1).toString().padStart(5, '0');
    return `${currentYear}_${customId}_${nextSequence}`;
  }

  // Default case: start new sequence
  return `${currentYear}_${profileId}_00001`;
};

const validateBusinessProfile = (profile) => {
  const required = ['company_name', 'company_street', 'company_postalcode', 'company_city'];
  return required.every(field => profile[field]?.trim());
};

const validateCustomer = (customer) => {
  const required = ['name', 'street', 'postal_code', 'city'];
  return required.every(field => customer[field]?.trim());
};

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

const generateUniqueId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

const EMPTY_PROFILE = {
  company_name: '', company_street: '', company_postalcode: '', company_city: '',
  tax_number: '', tax_id: '', bank_institute: '', bank_iban: '', bank_bic: '',
  contact_details: '', invoice_save_path: '', vat_enabled: false, vat_rate: 19,
};

const EMPTY_CUSTOMER = {
  id: '', title: TITLE_STORAGE_VALUES[TITLE_KEYS.NEUTRAL],
  zusatz: ACADEMIC_STORAGE_VALUES[ACADEMIC_TITLE_KEYS.NONE],
  name: '', street: '', postal_code: '', city: '', firma: false,
};

const EMPTY_TAG = {
  name: '', description: '', rate: '', quantity: '',
  color: PREDEFINED_COLORS[0].value, hasDateRange: true, visible: true, personas: [],
};


const adjustColorForDarkMode = (hexColor, isDark) => {
  if (!isDark) return hexColor;
  const r = Number.parseInt(hexColor.slice(1, 3), 16);
  const g = Number.parseInt(hexColor.slice(3, 5), 16);
  const b = Number.parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
};

const tagBgCache = new Map();
const getTagBackground = (color, isDark) => {
  const key = `${color}-${isDark}`;
  if (tagBgCache.has(key)) return tagBgCache.get(key);
  let result;
  if (isDark) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (rgb) {
      const r = Number.parseInt(rgb[1], 16);
      const g = Number.parseInt(rgb[2], 16);
      const b = Number.parseInt(rgb[3], 16);
      result = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(${r}, ${g}, ${b}, 0.05) 100%)`;
    }
  } else {
    result = `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`;
  }
  tagBgCache.set(key, result);
  return result;
};

const SlyceInvoice = () => {
  const { t, i18n } = useTranslation();

  // Business Profiles State
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({ ...EMPTY_PROFILE });

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ ...EMPTY_CUSTOMER });


  // Quick Tags State
  const [quickTags, setQuickTags] = useState([]);
  const [newTag, setNewTag] = useState({ ...EMPTY_TAG });

  // Invoice State
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState('');
  const [invoiceDates, setInvoiceDates] = useState({
    startDate: '',
    endDate: '',
    hasDateRange: true,
    showDate: true,
  });
  const [invoiceReference, setInvoiceReference] = useState('');
  const [invoicePaid, setInvoicePaid] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [eRechnungEnabled, setERechnungEnabled] = useState(false);

  // UI State
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Default Profile State
  const [defaultProfileId, setDefaultProfileId] = useState(null);

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingTag, setPendingTag] = useState(null);

  const [isLoading, setIsLoading] = useState({
    invoice: false,
    export: false,
    import: false,
  });

  const [tagSearch, setTagSearch] = useState('');

  // Add state for search visibility
  const [showTagSearch, setShowTagSearch] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [profileInvoiceNumbers, setProfileInvoiceNumbers] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [invoiceLanguage, setInvoiceLanguage] = useState('auto');
  const [savePath, setSavePath] = useState('');

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedProfiles = await api.getData('businessProfiles');
        const savedCustomers = await api.getData('customers');
        const savedTags = await api.getData('quickTags');
        const savedInvoiceNumbers = await api.getData('profileInvoiceNumbers') || {};
        const savedCurrency = await api.getData('currency');
        const savedERechnung = await api.getData('eRechnungEnabled');

        if (savedProfiles) setBusinessProfiles(savedProfiles);
        if (savedERechnung !== null && savedERechnung !== undefined) setERechnungEnabled(savedERechnung);
        if (savedCustomers) {
          const customersWithIds = savedCustomers.map(customer => 
            customer.id ? customer : { ...customer, id: generateUniqueId() }
          );
          setCustomers(customersWithIds);
        }
        if (savedTags) setQuickTags(savedTags);
        if (savedInvoiceNumbers) setProfileInvoiceNumbers(savedInvoiceNumbers);
        if (savedCurrency) setSelectedCurrency(savedCurrency);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsInitialized(true);
      }
    };

    loadSavedData();

    // Add currency change listener
    const handleCurrencyChange = (event) => {
      setSelectedCurrency(event.detail);
    };
    window.addEventListener('currencyChanged', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  // Per-key persistence — only writes the key that actually changed
  useEffect(() => { if (isInitialized) api.setData('businessProfiles', businessProfiles); }, [businessProfiles, isInitialized]);
  useEffect(() => { if (isInitialized) api.setData('customers', customers); }, [customers, isInitialized]);
  useEffect(() => { if (isInitialized) api.setData('quickTags', quickTags); }, [quickTags, isInitialized]);
  useEffect(() => { if (isInitialized) api.setData('profileInvoiceNumbers', profileInvoiceNumbers); }, [profileInvoiceNumbers, isInitialized]);
  useEffect(() => { if (isInitialized) api.setData('currency', selectedCurrency); }, [selectedCurrency, isInitialized]);
  useEffect(() => { if (isInitialized && defaultProfileId) api.setData('defaultProfileId', defaultProfileId); }, [defaultProfileId, isInitialized]);

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

    // Check if this is the first profile being added
    const isFirstProfile = businessProfiles.length === 0;

    setBusinessProfiles([...businessProfiles, newProfile]);
    setNewProfile({ ...EMPTY_PROFILE });
    setShowNewProfileDialog(false);

    // If this is the first profile, set it as the default
    if (isFirstProfile) {
      setDefaultProfileId(newProfile.company_name);
      setSelectedProfile(newProfile);
    }
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
    setNewCustomer({ ...EMPTY_CUSTOMER });
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
    setNewTag({ ...EMPTY_TAG });
    setShowNewTagDialog(false);
    setShowWarningDialog(false);
    setPendingTag(null);
  };

  const addInvoiceItem = (hasDateRange = true) => {
    const newItem = { description: '', quantity: 1, rate: 0, hasDateRange };
    setInvoiceItems(prev => {
      const next = [...prev, newItem];
      updateDateRangeToggle(next);
      return next;
    });
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = (field === 'quantity' || field === 'rate') ? (parseFloat(value) || 0) : value;
    setInvoiceItems(newItems);
  };

  const deleteInvoiceItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
    updateDateRangeToggle(newItems);
  };

  useEffect(() => {
    const loadInvoiceLanguage = async () => {
      const settings = await api.getData('invoiceLanguageSettings');
      if (settings?.invoiceLanguage) {
        setInvoiceLanguage(settings.invoiceLanguage);
      }
    };
    loadInvoiceLanguage();

    const handleInvoiceLanguageChange = (event) => {
      setInvoiceLanguage(event.detail.invoiceLanguage);
    };
    window.addEventListener('invoiceLanguageChanged', handleInvoiceLanguageChange);
    
    return () => {
      window.removeEventListener('invoiceLanguageChanged', handleInvoiceLanguageChange);
    };
  }, []);

  // Generate invoice PDF for preview (does NOT save to disk)
  const generateInvoice = async () => {
    if (!selectedCustomer) { toast.error(t('messages.validation.selectCustomer')); return; }
    if (!selectedProfile) { toast.error(t('messages.validation.selectProfile')); return; }
    if (invoiceDates.showDate) {
      if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
        toast.error(t('messages.validation.setServicePeriod')); return;
      }
      if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
        toast.error(t('messages.validation.setServiceDate')); return;
      }
    }
    if (invoiceItems.length === 0) { toast.error(t('messages.validation.addItem')); return; }

    setIsLoading(prev => ({ ...prev, invoice: true }));
    try {
      const { pdfArrayBuffer, fileName } = await generateInvoicePdf({
        profile: selectedProfile,
        customer: selectedCustomer,
        items: invoiceItems,
        invoiceDates,
        currentInvoiceNumber,
        invoiceReference,
        invoicePaid,
        invoiceDueDate,
        invoiceLanguageSetting: invoiceLanguage,
        eRechnungEnabled,
        selectedCurrency,
        i18n,
        t,
        formatCurrency,
      });

      // Hold PDF in memory for preview — nothing saved yet
      // WKWebView doesn't support blob URLs in iframes, so use a base64 data URL
      const bytes = new Uint8Array(pdfArrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const dataUrl = `data:application/pdf;base64,${btoa(binary)}`;
      setPendingInvoice({
        pdfArrayBuffer,
        fileName,
        blobUrl: dataUrl,
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(t('messages.error.generatingInvoice'));
    } finally {
      setIsLoading(prev => ({ ...prev, invoice: false }));
    }
  };

  // Accept: save PDF to disk, advance invoice number, clear form
  const acceptInvoice = async () => {
    if (!pendingInvoice) return;
    try {
      const saved = await saveInvoicePdf(pendingInvoice.pdfArrayBuffer, pendingInvoice.fileName, savePath);
      if (saved) {
        toast.success(t('messages.success.invoiceGenerated'));
        // Advance invoice number
        const nextNumber = generateInvoiceNumber(currentInvoiceNumber, selectedProfile.company_name, true);
        setCurrentInvoiceNumber(nextNumber);
        const updatedNumbers = { ...profileInvoiceNumbers, [selectedProfile.company_name]: nextNumber };
        setProfileInvoiceNumbers(updatedNumbers);
        await api.setData('profileInvoiceNumbers', updatedNumbers);
        // Clear form
        setInvoiceItems([]);
        setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true, showDate: true });
        setInvoiceReference('');
        setInvoicePaid(false);
        setInvoiceDueDate('');
      } else {
        toast.error(t('messages.error.savingInvoice'));
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(t('messages.error.savingInvoice'));
    } finally {
      cleanupPreview();
    }
  };

  // Reject: discard PDF, keep form data intact
  const rejectInvoice = () => {
    cleanupPreview();
  };

  const cleanupPreview = () => {
    setPendingInvoice(null);
  };

  // Form Rendering Functions
  const renderBusinessProfileForm = (profile, setProfile) => {
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

    // Helper function to get the title key from storage value
    const getTitleKeyFromStorage = (storageValue) => {
      return Object.entries(TITLE_STORAGE_VALUES)
        .find(([_, value]) => value === storageValue)?.[0] || 'neutral';
    };

    // Helper function to get the academic title key from storage value
    const getAcademicTitleKeyFromStorage = (storageValue) => {
      return Object.entries(ACADEMIC_STORAGE_VALUES)
        .find(([_, value]) => value === storageValue)?.[0] || 'none';
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>{t('customers.form.title')}</Label>
            <Select
              value={getTitleKeyFromStorage(customer.title)}
              onValueChange={(key) => setCustomer({ 
                ...customer, 
                title: TITLE_STORAGE_VALUES[key] 
              })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('customers.form.selectTitle')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TITLE_KEYS.NEUTRAL}>
                  {t('customers.form.titles.neutral')}
                </SelectItem>
                <SelectItem value={TITLE_KEYS.MR}>
                  {t('customers.form.titles.mr')}
                </SelectItem>
                <SelectItem value={TITLE_KEYS.MRS}>
                  {t('customers.form.titles.mrs')}
                </SelectItem>
                <SelectItem value={TITLE_KEYS.DIVERSE}>
                  {t('customers.form.titles.diverse')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('customers.form.academicTitle.label')}</Label>
            <Select
              value={getAcademicTitleKeyFromStorage(customer.zusatz)}
              onValueChange={(key) => setCustomer({ 
                ...customer, 
                zusatz: ACADEMIC_STORAGE_VALUES[key] 
              })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('customers.form.academicTitle.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACADEMIC_TITLE_KEYS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {t(`customers.form.academicTitle.options.${value}`)}
                  </SelectItem>
                ))}
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

  const updateDateRangeToggle = (items) => {
    const needsDateRange = items.some(item => item.hasDateRange);
    setInvoiceDates(prev => ({
      ...prev,
      hasDateRange: needsDateRange,
      // Only reset dates if switching from date range to single date or vice versa
      startDate: prev.startDate || '',
      endDate: needsDateRange ? (prev.endDate || '') : ''
    }));
  };

  const handleQuickTagClick = (tag) => {
    const newItem = {
      description: tag.description,
      quantity: parseFloat(tag.quantity),
      rate: parseFloat(tag.rate),
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

const handleTagDialog = (existingTag = null) => {
  setNewTag(existingTag || { ...EMPTY_TAG });
  setShowNewTagDialog(true);
};

const handleProfileDialog = (existingProfile = null) => {
  setNewProfile(existingProfile || { ...EMPTY_PROFILE });
  setShowNewProfileDialog(true);
};

const handleCustomerDialog = (existingCustomer = null) => {
  setNewCustomer(existingCustomer || { ...EMPTY_CUSTOMER });
  setShowNewCustomerDialog(true);
};

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

// Listen for e-Rechnung setting changes
useEffect(() => {
  const handleERechnungChange = (event) => setERechnungEnabled(event.detail);
  const handleSettingsChange = (event) => setSavePath(event.detail?.savePath || '');
  window.addEventListener('eRechnungChanged', handleERechnungChange);
  window.addEventListener('previewSettingsChanged', handleSettingsChange);
  api.getData('previewSettings').then(s => { if (s?.savePath) setSavePath(s.savePath); });
  return () => {
    window.removeEventListener('eRechnungChanged', handleERechnungChange);
    window.removeEventListener('previewSettingsChanged', handleSettingsChange);
  };
}, []);

// Initialize/update invoice number when profile changes
useEffect(() => {
  if (selectedProfile) {
    const profileId = selectedProfile.company_name;
    const lastNumber = profileInvoiceNumbers[profileId];
    
    // Only generate new number if there isn't one already
    if (!lastNumber) {
      const newNumber = generateInvoiceNumber(lastNumber, profileId);
      setCurrentInvoiceNumber(newNumber);
      
      const updatedNumbers = {
        ...profileInvoiceNumbers,
        [profileId]: newNumber
      };
      setProfileInvoiceNumbers(updatedNumbers);
      api.setData('profileInvoiceNumbers', updatedNumbers).catch(error => {
        console.error('Error saving invoice number:', error);
      });
    } else {
      // Use the existing number
      setCurrentInvoiceNumber(lastNumber);
    }
  } else {
    setCurrentInvoiceNumber('');
  }
}, [selectedProfile]);

useEffect(() => {
  const loadDefaultProfile = async () => {
    try {
      const savedDefaultId = await api.getData('defaultProfileId');
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


// Add formatCurrency inside the component
const formatCurrency = (amount) => {
  if (!selectedCurrency?.code) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: selectedCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const updateInvoiceLanguage = async (language) => {
  try {
    await api.setData('invoiceLanguageSettings', { invoiceLanguage: language });
    setInvoiceLanguage(language);
    toast.success(t('settings.success.language'));
  } catch (error) {
    console.error('Error updating invoice language:', error);
    toast.error(t('settings.errors.updateLanguage'));
  }
};

// Main Render
  return (
    <>
      {isLoading.invoice && <LoadingOverlay />}
      <div className="container-large">
        <Toaster position="top-right" expand={true} richColors />
        <Tabs defaultValue="invoice" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="b-tabs">
            <TabsTrigger value="invoice" className="b-tab">
              <FileText />
              {t('invoice.title')}
            </TabsTrigger>
            <TabsTrigger value="customers" className="b-tab">
              <Users />
              {t('customers.title')}
            </TabsTrigger>
            <TabsTrigger value="business" className="b-tab">
              <Building2 />
              {t('business.title')}
            </TabsTrigger>
            <TabsTrigger value="tags" className="b-tab">
              <Tags />
              {t('tags.title')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="b-tab">
              <Settings />
              {t('settings.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="flex-1 flex flex-col min-h-0">
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
              selectedCurrency={selectedCurrency}
              formatCurrency={formatCurrency}
              invoiceReference={invoiceReference}
              setInvoiceReference={setInvoiceReference}
              invoicePaid={invoicePaid}
              setInvoicePaid={setInvoicePaid}
              invoiceDueDate={invoiceDueDate}
              setInvoiceDueDate={setInvoiceDueDate}
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
            <SettingsTab 
              invoiceLanguage={invoiceLanguage}
              updateInvoiceLanguage={updateInvoiceLanguage}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>Missing Values</DialogTitle>
              <DialogDescription className="b-mono" style={{ fontSize: '0.75rem' }}>
                Rate or quantity is empty. Would you like to set them to 0 and continue?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 p-4">
              <button className="b-btn b-btn-outline" onClick={() => {
                setShowWarningDialog(false);
                setPendingTag(null);
              }}>
                Cancel
              </button>
              <button className="b-btn" onClick={() => proceedWithAddingTag(pendingTag)}>
                Set to 0 and Continue
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice preview with accept/reject */}
        {pendingInvoice && (
          <InvoicePreviewDialog
            preview={pendingInvoice}
            onAccept={acceptInvoice}
            onReject={rejectInvoice}
          />
        )}
      </div>
    </>
  );
};

export default SlyceInvoice;
