import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Helper Functions (move these to a separate utils file later)
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

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export function useSlyceInvoice() {
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
    quantity: '1',
    color: '#cbd5e1',
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

  // Warning Dialog State
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingTag, setPendingTag] = useState(null);

  // Loading States
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

  // Business Profile Functions
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

  // Customer Functions
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

  // Edit Customer Functions
  const editCustomer = (updatedCustomer) => {
    if (!validateCustomer(updatedCustomer)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setCustomers(customers.map(c => 
      c.id === updatedCustomer.id ? updatedCustomer : c
    ));
    setEditingCustomer(null);
    setShowEditCustomerDialog(false);
  };

  const deleteCustomer = (customerId) => {
    setCustomers(customers.filter(c => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
  };

  // Business Profile Functions
  const editBusinessProfile = (updatedProfile) => {
    if (!validateBusinessProfile(updatedProfile)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setBusinessProfiles(businessProfiles.map(p => 
      p.company_name === updatedProfile.company_name ? updatedProfile : p
    ));
    setEditingProfile(null);
    setShowEditProfileDialog(false);
  };

  const deleteBusinessProfile = (profileName) => {
    setBusinessProfiles(businessProfiles.filter(p => p.company_name !== profileName));
    if (selectedProfile?.company_name === profileName) {
      setSelectedProfile(null);
    }
    if (defaultProfileId === profileName) {
      setDefaultProfileId(null);
    }
  };

  // Quick Tag Functions
  const addQuickTag = () => {
    if (!newTag.name || !newTag.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const tagWithId = {
      ...newTag,
      id: generateUniqueId(),
    };

    setQuickTags([...quickTags, tagWithId]);
    setNewTag({
      name: '',
      description: '',
      rate: '',
      quantity: '1',
      color: '#cbd5e1',
      hasDateRange: true,
      visible: true,
      personas: [],
    });
    setShowNewTagDialog(false);
  };

  const editQuickTag = (updatedTag) => {
    if (!updatedTag.name || !updatedTag.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setQuickTags(quickTags.map(t => 
      t.id === updatedTag.id ? updatedTag : t
    ));
    setEditingTag(null);
    setShowEditTagDialog(false);
  };

  const deleteQuickTag = (tagId) => {
    setQuickTags(quickTags.filter(t => t.id !== tagId));
  };

  // Invoice Functions
  const addInvoiceItem = (item) => {
    setInvoiceItems([...invoiceItems, { ...item, id: generateUniqueId() }]);
  };

  const updateInvoiceItem = (updatedItem) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const removeInvoiceItem = (itemId) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  const generateInvoice = async () => {
    if (!selectedProfile || !selectedCustomer || invoiceItems.length === 0) {
      toast.error('Please fill in all required information.');
      return;
    }

    setIsLoading(prev => ({ ...prev, invoice: true }));
    try {
      const invoiceData = {
        profile: selectedProfile,
        customer: selectedCustomer,
        items: invoiceItems,
        dates: invoiceDates,
        invoiceNumber: currentInvoiceNumber,
      };

      await window.electronAPI.generateInvoice(invoiceData);
      await window.electronAPI.setData('lastInvoiceNumber', currentInvoiceNumber);
      
      // Reset invoice items and generate new invoice number
      setInvoiceItems([]);
      setCurrentInvoiceNumber(generateInvoiceNumber(currentInvoiceNumber));
      
      toast.success('Invoice generated successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice.');
    } finally {
      setIsLoading(prev => ({ ...prev, invoice: false }));
    }
  };

  // Export/Import Functions
  const exportData = async () => {
    setIsLoading(prev => ({ ...prev, export: true }));
    try {
      const data = {
        businessProfiles,
        customers,
        quickTags,
        defaultProfileId,
      };
      await window.electronAPI.exportData(data);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data.');
    } finally {
      setIsLoading(prev => ({ ...prev, export: false }));
    }
  };

  const importData = async (importedData) => {
    setIsLoading(prev => ({ ...prev, import: true }));
    try {
      setBusinessProfiles(importedData.businessProfiles || []);
      setCustomers(importedData.customers || []);
      setQuickTags(importedData.quickTags || []);
      setDefaultProfileId(importedData.defaultProfileId || null);
      toast.success('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data.');
    } finally {
      setIsLoading(prev => ({ ...prev, import: false }));
    }
  };

  // Return all the state and functions needed by the UI
  return {
    // State
    businessProfiles,
    selectedProfile,
    newProfile,
    customers,
    selectedCustomer,
    newCustomer,
    quickTags,
    newTag,
    invoiceItems,
    currentInvoiceNumber,
    invoiceDates,
    showNewProfileDialog,
    showNewCustomerDialog,
    showNewTagDialog,
    editingCustomer,
    editingProfile,
    editingTag,
    showEditCustomerDialog,
    showEditProfileDialog,
    showEditTagDialog,
    defaultProfileId,
    showWarningDialog,
    pendingTag,
    isLoading,

    // Setters
    setBusinessProfiles,
    setSelectedProfile,
    setNewProfile,
    setCustomers,
    setSelectedCustomer,
    setNewCustomer,
    setQuickTags,
    setNewTag,
    setInvoiceItems,
    setCurrentInvoiceNumber,
    setInvoiceDates,
    setShowNewProfileDialog,
    setShowNewCustomerDialog,
    setShowNewTagDialog,
    setEditingCustomer,
    setEditingProfile,
    setEditingTag,
    setShowEditCustomerDialog,
    setShowEditProfileDialog,
    setShowEditTagDialog,
    setDefaultProfileId,
    setShowWarningDialog,
    setPendingTag,
    setIsLoading,

    // Functions
    addBusinessProfile,
    addCustomer,
    editCustomer,
    deleteCustomer,
    editBusinessProfile,
    deleteBusinessProfile,
    addQuickTag,
    editQuickTag,
    deleteQuickTag,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    generateInvoice,
    exportData,
    importData,
  };
} 