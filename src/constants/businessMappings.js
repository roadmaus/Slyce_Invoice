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
    es: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Número Fiscal',
      [BUSINESS_KEYS.TAX_ID]: 'NIF/CIF',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Entidad Bancaria',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    ko: {
      [BUSINESS_KEYS.TAX_NUMBER]: '사업자등록번호',
      [BUSINESS_KEYS.TAX_ID]: '부가가치세 등록번호',
      [BUSINESS_KEYS.BANK_INSTITUTE]: '금융기관',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    fr: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Numéro fiscal',
      [BUSINESS_KEYS.TAX_ID]: 'Numéro TVA',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Établissement bancaire',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC'
    },
    zh: {
      [BUSINESS_KEYS.TAX_NUMBER]: '税号',
      [BUSINESS_KEYS.TAX_ID]: '增值税号',
      [BUSINESS_KEYS.BANK_INSTITUTE]: '银行机构',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC代码'
    },
    ja: {
      [BUSINESS_KEYS.TAX_NUMBER]: '税務番号',
      [BUSINESS_KEYS.TAX_ID]: '消費税番号',
      [BUSINESS_KEYS.BANK_INSTITUTE]: '金融機関',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BICコード'
    },
    pt: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Número Fiscal',
      [BUSINESS_KEYS.TAX_ID]: 'Número de IVA',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Instituição Bancária',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    ru: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'ИНН',
      [BUSINESS_KEYS.TAX_ID]: 'НДС номер',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Банк',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'БИК'
    },
    hi: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'कर संख्या',
      [BUSINESS_KEYS.TAX_ID]: 'जीएसटी संख्या',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'बैंक संस्थान',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    ar: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'الرقم الضريبي',
      [BUSINESS_KEYS.TAX_ID]: 'رقم ضريبة القيمة المضافة',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'المؤسسة المصرفية',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    it: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Codice Fiscale',
      [BUSINESS_KEYS.TAX_ID]: 'Partita IVA',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Istituto Bancario',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    nl: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Fiscaal nummer',
      [BUSINESS_KEYS.TAX_ID]: 'BTW-nummer',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Bankinstelling',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC'
    },
    tr: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Vergi Numarası',
      [BUSINESS_KEYS.TAX_ID]: 'KDV Numarası',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Banka Kurumu',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    vi: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'Mã số thuế',
      [BUSINESS_KEYS.TAX_ID]: 'Mã số GTGT',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'Ngân hàng',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    },
    th: {
      [BUSINESS_KEYS.TAX_NUMBER]: 'เลขประจำตัวผู้เสียภาษี',
      [BUSINESS_KEYS.TAX_ID]: 'เลขทะเบียนภาษีมูลค่าเพิ่ม',
      [BUSINESS_KEYS.BANK_INSTITUTE]: 'สถาบันการเงิน',
      [BUSINESS_KEYS.BANK_IBAN]: 'IBAN',
      [BUSINESS_KEYS.BANK_BIC]: 'BIC/SWIFT'
    }
  };