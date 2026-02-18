import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
import { TITLE_TRANSLATIONS, ACADEMIC_TRANSLATIONS } from '@/constants/languageMappings';
import { BUSINESS_KEYS, BUSINESS_STORAGE_VALUES, BUSINESS_TRANSLATIONS } from '@/constants/businessMappings';
import LoadingOverlay from './LoadingOverlay';
import html2pdf from 'html2pdf.js';
import { api } from '@/lib/api';

// Helper Functions
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

// Add this helper function at the top with other helper functions
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


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

// Date formatting
const formatDate = (date) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

// Add these helper functions at the top of your file
const getTranslatedTitle = (storedTitle, language) => {
  // Find the key for the stored German value
  const titleKey = Object.entries(TITLE_STORAGE_VALUES)
    .find(([_, value]) => value === storedTitle)?.[0];

  // Debug logging
  console.log('Stored Title:', storedTitle);
  console.log('Title Key:', titleKey);
  console.log('Language:', language);
  console.log('Available Translations:', TITLE_TRANSLATIONS[language]);

  // If no key found or neutral, return empty string
  if (!titleKey || titleKey === TITLE_KEYS.NEUTRAL) return '';

  // Get translations for the requested language, fallback to German if not found
  const translations = TITLE_TRANSLATIONS[language] || TITLE_TRANSLATIONS['de'];
  
  // Get the translated title
  const translatedTitle = translations[titleKey];
  console.log('Translated Title:', translatedTitle);

  return translatedTitle || storedTitle;
};

// Add this helper function alongside getTranslatedTitle
const getTranslatedAcademicTitle = (storedTitle, language) => {
  // Find the key for the stored value
  const academicKey = Object.entries(ACADEMIC_STORAGE_VALUES)
    .find(([_, value]) => value === storedTitle)?.[0];

  // If no key found or none, return empty string
  if (!academicKey || academicKey === ACADEMIC_TITLE_KEYS.NONE) return '';

  // Get translations for the requested language, fallback to English
  const translations = ACADEMIC_TRANSLATIONS[language] || ACADEMIC_TRANSLATIONS['en'];
  
  // Get the translated title
  const translatedTitle = translations[academicKey];

  return translatedTitle || storedTitle;
};

// Add this new helper function
const formatCustomerName = (customer, language, includeTitle = true, includeHonorific = true) => {
  const parts = [];

  // Handle title translation (e.g., Mr/Mrs)
  if (includeTitle && customer.title && customer.title !== 'neutral') {
    // Skip diverse title in address formatting
    if (customer.title !== TITLE_STORAGE_VALUES[TITLE_KEYS.DIVERSE]) {
      const translatedTitle = getTranslatedTitle(customer.title, language);
      if (translatedTitle) {
        parts.push(translatedTitle);
      }
    }
  }

  // Handle academic title (e.g., Prof/Dr)
  if (includeHonorific && customer.zusatz && customer.zusatz !== 'none') {
    const translatedAcademicTitle = getTranslatedAcademicTitle(customer.zusatz, language);
    if (translatedAcademicTitle) {
      parts.push(translatedAcademicTitle);
    }
  }

  // Add name
  parts.push(customer.name);

  // For Japanese/Chinese, add honorific suffix if in greeting
  if (includeHonorific && ['ja', 'zh'].includes(language)) {
    const honorific = language === 'ja' ? '様' : '先生';
    return parts.join(' ') + honorific;
  }

  return parts.join(' ');
};

// Update formatCustomerAddress to use the new function
const formatCustomerAddress = (customer, language) => {
  const addressParts = [];

  // Use the new unified formatting function
  addressParts.push(formatCustomerName(customer, language));
  addressParts.push(customer.street);
  addressParts.push(`${customer.postal_code} ${customer.city}`);

  return addressParts.filter(Boolean).join('<br>');
};

// Update the formatGreeting function
const formatGreeting = (customer, language, t) => {
  // If it's a business customer, use business greeting
  if (customer.firma) {
    return t('invoice.greeting.business');
  }

  // Map the stored title value back to the TITLE_KEY
  const titleKey = Object.entries(TITLE_STORAGE_VALUES)
    .find(([_, value]) => value === customer.title)?.[0];

  // Map TITLE_KEYS to the greeting keys used in locale files
  const greetingKeyMap = {
    [TITLE_KEYS.MR]: 'mr',
    [TITLE_KEYS.MRS]: 'mrs',
    [TITLE_KEYS.DIVERSE]: 'diverse',
    [TITLE_KEYS.NEUTRAL]: 'neutral'
  };

  // Get the greeting key, defaulting to neutral if not found
  const greetingKey = greetingKeyMap[titleKey] || 'neutral';

  // Check if customer has an academic title
  const hasAcademicTitle = customer.zusatz && 
    customer.zusatz !== ACADEMIC_STORAGE_VALUES[ACADEMIC_TITLE_KEYS.NONE];

  // Get the full i18n key path based on whether there's an academic title
  const greetingPath = `invoice.greeting.${greetingKey}.${hasAcademicTitle ? 'academic' : 'default'}`;

  // Get the greeting template from i18n
  const greetingTemplate = t(greetingPath);

  // Get the translated academic title if needed
  const academicTitle = hasAcademicTitle 
    ? getTranslatedAcademicTitle(customer.zusatz, language)
    : '';

  // Extract name parts
  const nameParts = customer.name.split(' ');
  const lastName = nameParts[nameParts.length - 1];
  const fullName = customer.name;

  // Replace placeholders in the template
  return greetingTemplate
    .replace('{title}', academicTitle)
    .replace('{last_name}', lastName)
    .replace('{full_name}', fullName);
};

// Add this helper function alongside other translation helpers
const getTranslatedBusinessField = (storedValue, fieldKey, language) => {
  // Debug log to see what we're getting
  console.log('Translation input:', { storedValue, fieldKey, language });

  // Find the key for the stored value by matching against BUSINESS_STORAGE_VALUES
  const businessKey = Object.entries(BUSINESS_STORAGE_VALUES)
    .find(([_, value]) => value === storedValue)?.[0] 
    || Object.entries(BUSINESS_STORAGE_VALUES)
    .find(([_, value]) => storedValue.includes(value))?.[0]
    || fieldKey;

  // Get translations for the requested language, fallback to English
  const translations = BUSINESS_TRANSLATIONS[language] || BUSINESS_TRANSLATIONS['en'];
  
  // Get the translated value
  const translatedValue = translations[businessKey];

  console.log('Translation result:', {
    businessKey,
    translations,
    translatedValue
  });

  return translatedValue || storedValue;
};

const SlyceInvoice = () => {
  const { t, i18n } = useTranslation();

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
    showDate: true,
  });
  const [invoiceReference, setInvoiceReference] = useState('');
  const [invoicePaid, setInvoicePaid] = useState(false);

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

  // Add this with other state declarations
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);

  // In SlyceInvoice.jsx, add invoiceLanguage to state declarations
  const [invoiceLanguage, setInvoiceLanguage] = useState('auto');

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedProfiles = await api.getData('businessProfiles');
        const savedCustomers = await api.getData('customers');
        const savedTags = await api.getData('quickTags');
        const savedInvoiceNumbers = await api.getData('profileInvoiceNumbers') || {};
        const savedCurrency = await api.getData('currency');

        if (savedProfiles) setBusinessProfiles(savedProfiles);
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

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveData = async () => {
        await api.setData('businessProfiles', businessProfiles);
        await api.setData('customers', customers);
        await api.setData('quickTags', quickTags);
        await api.setData('profileInvoiceNumbers', profileInvoiceNumbers);
        await api.setData('currency', selectedCurrency);
        if (defaultProfileId) {
          await api.setData('defaultProfileId', defaultProfileId);
        }
      };
      saveData();
    }
  }, [businessProfiles, customers, quickTags, defaultProfileId, profileInvoiceNumbers, selectedCurrency, isInitialized]);

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
    setInvoiceItems(prev => [
      ...prev,
      {
        description: '',
        quantity: 1,
        rate: 0,
        total: 0,
        hasDateRange,
      },
    ]);
    
    // Update the date range toggle without clearing existing dates
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

  // Add this useEffect to load the setting
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

  // Update the generateInvoice function
  const generateInvoice = async () => {
    // Custom validation before proceeding
    if (!selectedCustomer) {
      toast.error(t('messages.validation.selectCustomer'));
      return;
    }

    if (!selectedProfile) {
      toast.error(t('messages.validation.selectProfile'));
      return;
    }

    // Only validate dates if they are being shown
    if (invoiceDates.showDate) {
      if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
        toast.error(t('messages.validation.setServicePeriod'));
        return;
      }

      if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
        toast.error(t('messages.validation.setServiceDate'));
        return;
      }
    }

    if (invoiceItems.length === 0) {
      toast.error(t('messages.validation.addItem'));
      return;
    }

    setIsLoading(prev => ({ ...prev, invoice: true }));
    const currentLanguage = i18n.language;
    
    try {
      // Determine invoice language
      let invoiceLang = invoiceLanguage;
      if (invoiceLanguage === 'auto') {
        // Use customer's country/region to determine language
        if (selectedCustomer?.country === 'DE' || selectedCustomer?.country === 'AT' || selectedCustomer?.country === 'CH') {
          invoiceLang = 'de';
        } else {
          invoiceLang = 'en'; // Default to English for auto
        }
      }
      
      // Switch to invoice language
      await i18n.changeLanguage(invoiceLang);

      const template = await api.getInvoiceTemplate();
      
      // Use the same formatting function for both address and greeting
      const customerAddress = formatCustomerAddress(selectedCustomer, invoiceLang);
      const customerGreeting = formatGreeting(selectedCustomer, invoiceLang, t);

      // Get translations for business fields
      const taxNumberLabel = await getTranslatedBusinessField(
        BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.TAX_NUMBER],
        'taxNumber',
        invoiceLang
      );
      
      const taxIdLabel = await getTranslatedBusinessField(
        BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.TAX_ID],
        'taxId',
        invoiceLang
      );

      // Prepare template data
      const templateData = {
        customer_address: customerAddress,
        customer_greeting: customerGreeting,
        // ... other template data ...
        
        // Tax information with labels
        tax_number_label: taxNumberLabel,
        tax_id_label: taxIdLabel,
        tax_number: selectedProfile.tax_number,
        tax_id: selectedProfile.tax_id,
        bank_institute_label: getTranslatedBusinessField(
          BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_INSTITUTE],
          BUSINESS_KEYS.BANK_INSTITUTE,
          invoiceLang
        ),
        bank_iban_label: getTranslatedBusinessField(
          BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_IBAN],
          BUSINESS_KEYS.BANK_IBAN,
          invoiceLang
        ),
        bank_bic_label: getTranslatedBusinessField(
          BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_BIC],
          BUSINESS_KEYS.BANK_BIC,
          invoiceLang
        ),
        // The actual values remain unchanged
        bank_institute: selectedProfile.bank_institute,
        bank_iban: selectedProfile.bank_iban,
        bank_bic: selectedProfile.bank_bic
      };

      // Replace placeholders in template
      let html = template;
      
      // Log the values before replacement
      console.log('Tax Labels:', {
        tax_number_label: templateData.tax_number_label,
        tax_id_label: templateData.tax_id_label,
        tax_number: templateData.tax_number,
        tax_id: templateData.tax_id
      });

      // Replace each placeholder
      Object.entries(templateData).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        html = html.replaceAll(placeholder, value || '');
      });

      // Log a snippet of the HTML after replacement
      console.log('HTML after replacement (snippet):', html.substring(0, 500));

      // Calculate amounts
      const netTotal = calculateTotal();
      const vatRate = selectedProfile.vat_enabled ? (selectedProfile.vat_rate || 19) : 0;
      const vatAmount = selectedProfile.vat_enabled ? (netTotal * (vatRate / 100)) : 0;
      const totalAmount = netTotal + vatAmount;

      // Format service period text
      const servicePeriodText = !invoiceDates.showDate
        ? t('invoice.servicePeriod.noDate')
        : invoiceDates.hasDateRange
          ? t('invoice.servicePeriod.range', {
              startDate: formatDate(invoiceDates.startDate),
              endDate: formatDate(invoiceDates.endDate)
            }).replace('{startDate}', formatDate(invoiceDates.startDate))
              .replace('{endDate}', formatDate(invoiceDates.endDate))
          : t('invoice.servicePeriod.single', {
              date: formatDate(invoiceDates.startDate)
            }).replace('{date}', formatDate(invoiceDates.startDate));

      // Create VAT-related HTML
      const vatNoticeHtml = selectedProfile.vat_enabled
        ? `<p>${t('invoice.totals.vatNotice.enabled')}</p>`
        : `<p>${t('invoice.totals.vatNotice.disabled')}</p>`;

      const vatRowHtml = selectedProfile.vat_enabled 
        ? `<tr>
            <td>${t('invoice.totals.vat', { rate: vatRate })}:</td>
            <td>${formatCurrency(vatAmount)}</td>
          </tr>`
        : '';

      // Format invoice header
      const invoiceNumberDate = [
        `${t('invoice.details.number.label')}: ${currentInvoiceNumber}`,
        `${t('invoice.details.date.label')}: ${formatDate(new Date())}`
      ].join('<br>');

      // Add reference text if present
      const referenceText = invoiceReference 
        ? invoiceReference 
        : '';
      
      // Create reference section HTML only if there's content
      const referenceSectionHtml = invoiceReference
        ? `<div class="reference-section" style="margin: 24px 0;">
            <p style="margin: 0;"><strong>Betreff:</strong> ${invoiceReference}</p>
          </div>`
        : '';

      // Remove paid status label - we'll only show it in the payment text
      const paidStatus = '';

      // Format invoice items
      const formattedInvoiceItems = invoiceItems.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.quantity}</td>
          <td>${item.description}</td>
          <td>${formatCurrency(item.rate)}</td>
          <td>${formatCurrency(item.quantity * item.rate)}</td>
        </tr>
      `).join('');

      // Format payment instruction with amount
      const selectedCurrency = await api.getData('currency') || DEFAULT_CURRENCY;
      
      const paymentInstruction = invoicePaid
        ? t('invoice.payment.paid', {
            amount: formatCurrency(totalAmount, 'de-DE', selectedCurrency.code)
          }).replace('{amount}', formatCurrency(totalAmount, 'de-DE', selectedCurrency.code))
        : t('invoice.payment.instruction', {
            amount: formatCurrency(totalAmount, 'de-DE', selectedCurrency.code)
          }).replace('{amount}', formatCurrency(totalAmount, 'de-DE', selectedCurrency.code));

      // Format contact details - only include if they exist
      const contactDetailsHtml = selectedProfile.contact_details 
        ? selectedProfile.contact_details.split('\n').join('<br>')
        : '';

      // Replace all placeholders
      html = html
        .replaceAll('{company_name}', selectedProfile.company_name)
        .replaceAll('{company_street}', selectedProfile.company_street)
        .replaceAll('{company_postalcode}', selectedProfile.company_postalcode)
        .replaceAll('{company_city}', selectedProfile.company_city)
        .replaceAll('{tax_number}', selectedProfile.tax_number)
        .replaceAll('{tax_id}', selectedProfile.tax_id)
        .replaceAll('{customer_address}', customerAddress)
        .replaceAll('{invoice_number_date}', invoiceNumberDate)
        .replaceAll('{reference_section}', referenceSectionHtml)
        .replaceAll('{paid_status}', paidStatus)
        .replaceAll('{greeting}', customerGreeting)
        .replaceAll('{service_period_text}', servicePeriodText)
        .replaceAll('{position_label}', t('invoice.items.position'))
        .replaceAll('{quantity_label}', t('invoice.items.quantity'))
        .replaceAll('{description_label}', t('invoice.items.description'))
        .replaceAll('{unit_price_label}', t('invoice.items.rate'))
        .replaceAll('{total_label}', t('invoice.items.total'))
        .replaceAll('{net_amount_label}', t('invoice.totals.netAmount'))
        .replaceAll('{total_amount_label}', t('invoice.totals.totalAmount'))
        .replaceAll('{payment_instruction}', paymentInstruction)
        .replaceAll('{thank_you_note}', t('invoice.closing.thankYou'))
        .replaceAll('{closing}', t('invoice.closing.regards'))
        .replaceAll('{name_label}', t('invoice.banking.name'))
        .replaceAll('{bank_label}', t('invoice.banking.institute'))
        .replaceAll('{invoice_items}', formattedInvoiceItems)
        .replaceAll('{net_amount}', formatCurrency(netTotal))
        .replaceAll('{vat_row}', vatRowHtml)
        .replaceAll('{vat_notice}', vatNoticeHtml)
        .replaceAll('{total_amount}', formatCurrency(totalAmount))
        .replaceAll('{bank_institute}', selectedProfile.bank_institute)
        .replaceAll('{bank_iban}', selectedProfile.bank_iban)
        .replaceAll('{bank_bic}', selectedProfile.bank_bic)
        .replace('{contact_details}', contactDetailsHtml);

      // Instead of sending to main process, generate PDF directly
      const element = document.createElement('div');
      element.innerHTML = html;
      
      const opt = {
        margin: 10, // Small margin to prevent content touching the edge
        filename: `${selectedCustomer.name}_${currentInvoiceNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // Generate PDF
      const pdf = await html2pdf().set(opt).from(element).outputPdf('arraybuffer');
      
      // Save the PDF
      const fileName = `${selectedCustomer.name}_${currentInvoiceNumber}`;
      const settings = await api.getData('previewSettings');
      const saved = await api.saveInvoice(pdf, fileName, settings?.savePath);

      if (saved) {
        if (previewSettings.showPreview) {
          // Create Blob and URL for preview
          const blob = new Blob([pdf], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);
          
          setPdfPreview({
            show: true,
            data: pdfUrl,
            fileName: fileName
          });
        } else {
          toast.success(t('messages.success.invoiceGenerated'));
          
          const nextNumber = generateInvoiceNumber(
            currentInvoiceNumber, 
            selectedProfile.company_name, 
            true
          );
          setCurrentInvoiceNumber(nextNumber);
          setInvoiceItems([]);
          setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true, showDate: true });
        }

        // Save the current invoice number
        const updatedNumbers = {
          ...profileInvoiceNumbers,
          [selectedProfile.company_name]: currentInvoiceNumber
        };
        setProfileInvoiceNumbers(updatedNumbers);
        await api.setData('profileInvoiceNumbers', updatedNumbers);
      } else {
        toast.error(t('messages.error.savingInvoice'));
      }

      // Switch back to original language
      await i18n.changeLanguage(currentLanguage);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(t('messages.error.generatingInvoice'));
      await i18n.changeLanguage(currentLanguage);
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

  // Helper Functions
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

  // Validation function
  const validateInvoice = () => {
    if (!selectedCustomer) {
      toast.error(t('messages.validation.selectCustomer'));
      return false;
    }

    if (!selectedProfile) {
      toast.error(t('messages.validation.selectProfile'));
      return false;
    }

    // Only validate dates if they are being shown
    if (invoiceDates.showDate) {
      if (invoiceDates.hasDateRange && (!invoiceDates.startDate || !invoiceDates.endDate)) {
        toast.error(t('messages.validation.setServicePeriod'));
        return false;
      }

      if (!invoiceDates.hasDateRange && !invoiceDates.startDate) {
        toast.error(t('messages.validation.setServiceDate'));
        return false;
      }
    }

    if (invoiceItems.length === 0) {
      toast.error(t('messages.validation.addItem'));
      return false;
    }

    return true;
  };

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
      title: TITLE_STORAGE_VALUES[TITLE_KEYS.NEUTRAL], // Default to neutral
      zusatz: ACADEMIC_STORAGE_VALUES[ACADEMIC_TITLE_KEYS.NONE], // Default to none
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
    const settings = await api.getData('previewSettings');
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
        setInvoiceItems([]);
        setInvoiceDates({ startDate: '', endDate: '', hasDateRange: true, showDate: true });
        if (selectedProfile) {
          const nextNumber = generateInvoiceNumber(
            currentInvoiceNumber, 
            selectedProfile.company_name, 
            true
          );
          setCurrentInvoiceNumber(nextNumber);
          const updatedNumbers = {
            ...profileInvoiceNumbers,
            [selectedProfile.company_name]: nextNumber
          };
          setProfileInvoiceNumbers(updatedNumbers);
          api.setData('profileInvoiceNumbers', updatedNumbers).catch(error => {
            console.error('Error saving invoice number:', error);
          });
        }
      }
    }}
    className="z-[99]"
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

// Add effect to handle default profile
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

// Add this useEffect to handle currency changes
useEffect(() => {
  const loadCurrency = async () => {
    const saved = await api.getData('currency');
    if (saved) {
      setSelectedCurrency(saved);
    }
  };
  loadCurrency();

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.detail);
  };
  window.addEventListener('currencyChanged', handleCurrencyChange);
  
  return () => {
    window.removeEventListener('currencyChanged', handleCurrencyChange);
  };
}, []);

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

// Add this with other function declarations
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
        <Tabs defaultValue="invoice" className="w-full">
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
              selectedCurrency={selectedCurrency}
              formatCurrency={formatCurrency}
              invoiceReference={invoiceReference}
              setInvoiceReference={setInvoiceReference}
              invoicePaid={invoicePaid}
              setInvoicePaid={setInvoicePaid}
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

        {/* Add these dialogs at the bottom */}
        <PreviewDialog />
      </div>
    </>
  );
};

export default SlyceInvoice;
