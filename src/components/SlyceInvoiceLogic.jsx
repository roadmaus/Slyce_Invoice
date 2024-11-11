import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

// Constants
export const PREDEFINED_COLORS = [
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

// Helper Functions
export const generateInvoiceNumber = (lastNumber) => {
  const year = new Date().getFullYear();
  const currentYearPrefix = `${year}_`;
  
  if (!lastNumber || !lastNumber.startsWith(currentYearPrefix)) {
    return `${currentYearPrefix}00001`;
  }

  const sequence = parseInt(lastNumber.split('_')[1]) + 1;
  return `${currentYearPrefix}${sequence.toString().padStart(5, '0')}`;
};

export const validateBusinessProfile = (profile) => {
  const required = ['company_name', 'company_street', 'company_postalcode', 'company_city'];
  return required.every(field => profile[field]?.trim());
};

export const validateCustomer = (customer) => {
  const required = ['name', 'street', 'postal_code', 'city'];
  return required.every(field => customer[field]?.trim());
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDuration = (totalDays) => {
  const months = Math.floor(totalDays / 31);
  const days = totalDays % 31;
  const parts = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  return parts.join(' ');
};

export const daysToMonthsDays = (totalDays) => ({
  months: Math.floor(totalDays / 31),
  days: totalDays % 31
});

export const monthsDaysToDays = (months, days) => (months * 31) + days;

export const useSlyceInvoiceLogic = () => {
  // State declarations
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quickTags, setQuickTags] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState({
    id: generateUniqueId(),
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [],
    notes: '',
    terms: '',
    status: 'draft',
    color: PREDEFINED_COLORS[0].value,
  });
  const [showBusinessProfileForm, setShowBusinessProfileForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showQuickTagForm, setShowQuickTagForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingQuickTag, setEditingQuickTag] = useState(null);

  // useEffect hooks
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load business profiles
        const savedProfiles = localStorage.getItem('businessProfiles');
        if (savedProfiles) {
          const parsedProfiles = JSON.parse(savedProfiles);
          setBusinessProfiles(parsedProfiles);
          
          // Set selected profile if exists
          const lastSelectedId = localStorage.getItem('selectedProfileId');
          if (lastSelectedId) {
            const lastProfile = parsedProfiles.find(p => p.id === lastSelectedId);
            if (lastProfile) setSelectedProfile(lastProfile);
          }
        }

        // Load customers
        const savedCustomers = localStorage.getItem('customers');
        if (savedCustomers) {
          setCustomers(JSON.parse(savedCustomers));
        }

        // Load quick tags
        const savedQuickTags = localStorage.getItem('quickTags');
        if (savedQuickTags) {
          setQuickTags(JSON.parse(savedQuickTags));
        }

        // Load invoices
        const savedInvoices = localStorage.getItem('invoices');
        if (savedInvoices) {
          setInvoices(JSON.parse(savedInvoices));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        toast.error('Error loading saved data');
      }
    };

    loadSavedData();
  }, []);

  // Save effects
  useEffect(() => {
    localStorage.setItem('businessProfiles', JSON.stringify(businessProfiles));
  }, [businessProfiles]);

  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('selectedProfileId', selectedProfile.id);
    }
  }, [selectedProfile]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('quickTags', JSON.stringify(quickTags));
  }, [quickTags]);

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Business Profile Functions
  const addBusinessProfile = (profile) => {
    const newProfile = {
      ...profile,
      id: generateUniqueId(),
      created_at: new Date().toISOString()
    };
    setBusinessProfiles(prev => [...prev, newProfile]);
    setSelectedProfile(newProfile);
    setShowBusinessProfileForm(false);
    toast.success('Business profile added successfully');
  };

  const editBusinessProfile = (profile) => {
    setBusinessProfiles(prev => 
      prev.map(p => p.id === profile.id ? { ...profile, updated_at: new Date().toISOString() } : p)
    );
    setSelectedProfile(profile);
    setEditingProfile(null);
    toast.success('Business profile updated successfully');
  };

  const deleteBusinessProfile = (profileId) => {
    setBusinessProfiles(prev => prev.filter(p => p.id !== profileId));
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(null);
      localStorage.removeItem('selectedProfileId');
    }
    toast.success('Business profile deleted successfully');
  };

  // Customer Functions
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: generateUniqueId(),
      created_at: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    setShowCustomerForm(false);
    toast.success('Customer added successfully');
  };

  const editCustomer = (customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? { ...customer, updated_at: new Date().toISOString() } : c)
    );
    setSelectedCustomer(customer);
    setEditingCustomer(null);
    toast.success('Customer updated successfully');
  };

  const deleteCustomer = (customerId) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
    toast.success('Customer deleted successfully');
  };

  // Quick Tag Functions
  const addQuickTag = (tag) => {
    const newTag = {
      ...tag,
      id: generateUniqueId(),
      created_at: new Date().toISOString()
    };
    setQuickTags(prev => [...prev, newTag]);
    setShowQuickTagForm(false);
    toast.success('Quick tag added successfully');
  };

  const editQuickTag = (tag) => {
    setQuickTags(prev => 
      prev.map(t => t.id === tag.id ? { ...tag, updated_at: new Date().toISOString() } : t)
    );
    setEditingQuickTag(null);
    toast.success('Quick tag updated successfully');
  };

  const deleteQuickTag = (tagId) => {
    setQuickTags(prev => prev.filter(t => t.id !== tagId));
    toast.success('Quick tag deleted successfully');
  };

  // Invoice Functions
  const createInvoice = () => {
    const lastInvoice = invoices[invoices.length - 1];
    const newInvoice = {
      ...currentInvoice,
      number: generateInvoiceNumber(lastInvoice?.number),
      business_profile: selectedProfile,
      customer: selectedCustomer,
      created_at: new Date().toISOString()
    };
    setInvoices(prev => [...prev, newInvoice]);
    setCurrentInvoice({
      id: generateUniqueId(),
      number: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [],
      notes: '',
      terms: '',
      status: 'draft',
      color: PREDEFINED_COLORS[0].value,
    });
    toast.success('Invoice created successfully');
  };

  const updateInvoice = (invoice) => {
    setInvoices(prev => 
      prev.map(inv => inv.id === invoice.id ? { ...invoice, updated_at: new Date().toISOString() } : inv)
    );
    toast.success('Invoice updated successfully');
  };

  const deleteInvoice = (invoiceId) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    toast.success('Invoice deleted successfully');
  };

  const exportToPDF = async (invoiceId) => {
    try {
      const element = document.getElementById(`invoice-${invoiceId}`);
      if (!element) {
        throw new Error('Invoice element not found');
      }

      const opt = {
        margin: 1,
        filename: `invoice-${invoiceId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Invoice exported successfully');
    } catch (error) {
      console.error('Error exporting invoice:', error);
      toast.error('Error exporting invoice');
    }
  };

  // Invoice Item Functions
  const addInvoiceItem = (item) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: generateUniqueId() }]
    }));
  };

  const updateInvoiceItem = (itemId, updatedItem) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...updatedItem, id: itemId } : item
      )
    }));
  };

  const deleteInvoiceItem = (itemId) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Return all states and functions needed by the UI
  return {
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
  };
}; 