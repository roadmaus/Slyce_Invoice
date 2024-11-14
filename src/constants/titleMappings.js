// Internal standardized keys for titles
export const TITLE_KEYS = {
  MR: 'mr',
  MRS: 'mrs',
  DIVERSE: 'diverse',
  NEUTRAL: 'neutral'
};

// Internal standardized keys for academic titles
export const ACADEMIC_TITLE_KEYS = {
  NONE: 'none',
  DR: 'dr',
  PROF: 'prof',
  PROF_DR: 'profDr',
  DR_HC: 'drHc'
};

// Internal storage values mapped to display keys
export const TITLE_STORAGE_VALUES = {
  [TITLE_KEYS.MR]: 'Herr',      // Store as German
  [TITLE_KEYS.MRS]: 'Frau',     // Store as German
  [TITLE_KEYS.DIVERSE]: 'Divers', // Store as German
  [TITLE_KEYS.NEUTRAL]: 'neutral'
};

export const ACADEMIC_STORAGE_VALUES = {
  [ACADEMIC_TITLE_KEYS.NONE]: 'none',
  [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
  [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
  [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
  [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.'
}; 