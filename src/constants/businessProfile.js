export const DEFAULT_BUSINESS_PROFILE = {
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
  // XRechnung fields
  vat_number: '',
  phone: '',
  email: '',
  contact_name: '',
  bank_account: ''
};

export const resetBusinessProfile = () => ({...DEFAULT_BUSINESS_PROFILE}); 