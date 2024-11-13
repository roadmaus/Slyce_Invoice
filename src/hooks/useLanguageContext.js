import { useTranslation } from 'react-i18next';
import { TITLE_MAPPINGS, ACADEMIC_TITLE_MAPPINGS } from '@/constants/titleMappings';


export const useLanguageContext = () => {
  const { i18n } = useTranslation();
  const [invoiceLanguage, setInvoiceLanguage] = useState('en'); // Default to English for storage

  // Convert display value to storage key
  const toStorageValue = (displayValue, mappings) => {
    const currentMappings = mappings[i18n.language] || mappings['en'];
    return Object.entries(currentMappings)
      .find(([_, value]) => value === displayValue)?.[0] || displayValue;
  };

  // Convert storage key to display value
  const toDisplayValue = (storageKey, mappings) => {
    const currentMappings = mappings[i18n.language] || mappings['en'];
    return currentMappings[storageKey] || storageKey;
  };

  // Convert title for display
  const getTitleDisplay = (storageKey) => {
    return toDisplayValue(storageKey, TITLE_MAPPINGS);
  };

  // Convert academic title for display
  const getAcademicTitleDisplay = (storageKey) => {
    return toDisplayValue(storageKey, ACADEMIC_TITLE_MAPPINGS);
  };

  // Get available titles for current UI language
  const getAvailableTitles = () => {
    return Object.entries(TITLE_MAPPINGS[i18n.language] || TITLE_MAPPINGS['en'])
      .map(([key, value]) => ({ value: key, label: value }));
  };

  // Get available academic titles for current UI language
  const getAvailableAcademicTitles = () => {
    return Object.entries(ACADEMIC_TITLE_MAPPINGS[i18n.language] || ACADEMIC_TITLE_MAPPINGS['en'])
      .map(([key, value]) => ({ value: key, label: value }));
  };

  return {
    uiLanguage: i18n.language,
    invoiceLanguage,
    setInvoiceLanguage,
    getTitleDisplay,
    getAcademicTitleDisplay,
    getAvailableTitles,
    getAvailableAcademicTitles,
    toStorageValue,
    toDisplayValue
  };
}; 