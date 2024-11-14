// Internal standardized keys for business fields
export const BUSINESS_KEYS = {
  TAX_NUMBER: 'taxNumber',
  TAX_ID: 'taxId',
  BANK_INSTITUTE: 'bankInstitute',
  BANK_IBAN: 'iban',
  BANK_BIC: 'bic'
};

// Internal storage values (using German as base)
export const BUSINESS_STORAGE_VALUES = {
  [BUSINESS_KEYS.TAX_NUMBER]: 'Steuernummer',
  [BUSINESS_KEYS.TAX_ID]: 'USt-IdNr.',
  [BUSINESS_KEYS.BANK_INSTITUTE]: 'Kreditinstitut',
  [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
  [BUSINESS_KEYS.BANK_BIC]: 'BIC'
};

// Translations for different languages
export const BUSINESS_TRANSLATIONS = {
  en: {
    [BUSINESS_KEYS.TAX_NUMBER]: 'Tax Number',
    [BUSINESS_KEYS.TAX_ID]: 'VAT ID',
    [BUSINESS_KEYS.BANK_INSTITUTE]: 'Bank Institute',
    [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
    [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
  },
  de: {
    [BUSINESS_KEYS.TAX_NUMBER]: 'Steuernummer',
    [BUSINESS_KEYS.TAX_ID]: 'USt-IdNr.',
    [BUSINESS_KEYS.BANK_INSTITUTE]: 'Kreditinstitut',
    [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
    [BUSINESS_KEYS.BANK_BIC]: 'BIC'
  },
  fr: {
    [BUSINESS_KEYS.TAX_NUMBER]: 'Numéro fiscal',
    [BUSINESS_KEYS.TAX_ID]: 'Numéro TVA',
    [BUSINESS_KEYS.BANK_INSTITUTE]: 'Établissement bancaire',
    [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
    [BUSINESS_KEYS.BANK_BIC]: 'BIC'
  },
  ja: {
    [BUSINESS_KEYS.TAX_NUMBER]: '税務番号',
    [BUSINESS_KEYS.TAX_ID]: '消費税番号',
    [BUSINESS_KEYS.BANK_INSTITUTE]: '金融機関',
    [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
    [BUSINESS_KEYS.BANK_BIC]: 'BICコード'
  }
  // Add more languages as needed
}; 