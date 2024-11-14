import { TITLE_KEYS, ACADEMIC_TITLE_KEYS } from '@/constants/titleMappings';

export const TITLE_TRANSLATIONS = {
  en: {
    [TITLE_KEYS.MR]: 'Mr',
    [TITLE_KEYS.MRS]: 'Mrs',
    [TITLE_KEYS.DIVERSE]: 'Other',
    [TITLE_KEYS.NEUTRAL]: 'Neutral'
  },
  de: {
    [TITLE_KEYS.MR]: 'Herr',
    [TITLE_KEYS.MRS]: 'Frau',
    [TITLE_KEYS.DIVERSE]: 'Divers',
    [TITLE_KEYS.NEUTRAL]: 'Neutral'
  },
  es: {
    [TITLE_KEYS.MR]: 'Sr',
    [TITLE_KEYS.MRS]: 'Sra',
    [TITLE_KEYS.DIVERSE]: 'Otro',
    [TITLE_KEYS.NEUTRAL]: 'Neutral'
  },
  fr: {
    [TITLE_KEYS.MR]: 'M',
    [TITLE_KEYS.MRS]: 'Mme',
    [TITLE_KEYS.DIVERSE]: 'Autre',
    [TITLE_KEYS.NEUTRAL]: 'Neutral'
  },
  it: {
    [TITLE_KEYS.MR]: 'Sig',
    [TITLE_KEYS.MRS]: 'Sig.ra',
    [TITLE_KEYS.DIVERSE]: 'Altro',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  nl: {
    [TITLE_KEYS.MR]: 'Dhr',
    [TITLE_KEYS.MRS]: 'Mevr',
    [TITLE_KEYS.DIVERSE]: 'Anders',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  pt: {
    [TITLE_KEYS.MR]: 'Sr',
    [TITLE_KEYS.MRS]: 'Sra',
    [TITLE_KEYS.DIVERSE]: 'Outro',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  ru: {
    [TITLE_KEYS.MR]: 'Уважаемый',
    [TITLE_KEYS.MRS]: 'Уважаемая',
    [TITLE_KEYS.DIVERSE]: 'Уважаемые',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  zh: {
    [TITLE_KEYS.MR]: '先生',
    [TITLE_KEYS.MRS]: '女士',
    [TITLE_KEYS.DIVERSE]: '其他',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  ja: {
    [TITLE_KEYS.MR]: '様',
    [TITLE_KEYS.MRS]: '様',
    [TITLE_KEYS.DIVERSE]: 'その他',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  ko: {
    [TITLE_KEYS.MR]: '씨',
    [TITLE_KEYS.MRS]: '씨',
    [TITLE_KEYS.DIVERSE]: '기타',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  hi: {
    [TITLE_KEYS.MR]: 'श्री',
    [TITLE_KEYS.MRS]: 'श्रीमती',
    [TITLE_KEYS.DIVERSE]: 'अन्य',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  ar: {
    [TITLE_KEYS.MR]: 'السيد',
    [TITLE_KEYS.MRS]: 'السيدة',
    [TITLE_KEYS.DIVERSE]: 'آخر',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  tr: {
    [TITLE_KEYS.MR]: 'Bay',
    [TITLE_KEYS.MRS]: 'Bayan',
    [TITLE_KEYS.DIVERSE]: 'Diğer',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  vi: {
    [TITLE_KEYS.MR]: 'Ông',
    [TITLE_KEYS.MRS]: 'Bà',
    [TITLE_KEYS.DIVERSE]: 'Khác',
    [TITLE_KEYS.NEUTRAL]: ''
  },
  th: {
    [TITLE_KEYS.MR]: 'นาย',
    [TITLE_KEYS.MRS]: 'นาง',
    [TITLE_KEYS.DIVERSE]: 'อื่นๆ',
    [TITLE_KEYS.NEUTRAL]: ''
  }
};

export const ACADEMIC_TRANSLATIONS = {
  en: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  de: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  fr: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Pr',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Pr Dr',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  es: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  it: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dott.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dott.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dott. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  zh: {
    [ACADEMIC_TITLE_KEYS.DR]: '博士',
    [ACADEMIC_TITLE_KEYS.PROF]: '教授',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: '教授博士',
    [ACADEMIC_TITLE_KEYS.DR_HC]: '名誉博士',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  ja: {
    [ACADEMIC_TITLE_KEYS.DR]: '博士',
    [ACADEMIC_TITLE_KEYS.PROF]: '教授',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: '教授博士',
    [ACADEMIC_TITLE_KEYS.DR_HC]: '名誉博士',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  ko: {
    [ACADEMIC_TITLE_KEYS.DR]: '박사',
    [ACADEMIC_TITLE_KEYS.PROF]: '교수',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: '교수박사',
    [ACADEMIC_TITLE_KEYS.DR_HC]: '명예박사',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  ru: {
    [ACADEMIC_TITLE_KEYS.DR]: 'д-р',
    [ACADEMIC_TITLE_KEYS.PROF]: 'проф.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'проф. д-р',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'почетный д-р',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  pt: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  hi: {
    [ACADEMIC_TITLE_KEYS.DR]: 'डॉ.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'प्रो.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'प्रो. डॉ.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'डॉ. एच.सी.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  ar: {
    [ACADEMIC_TITLE_KEYS.DR]: 'د.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'أ.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'أ.د.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'د. فخري',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  nl: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  tr: {
    [ACADEMIC_TITLE_KEYS.DR]: 'Dr.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'Prof.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'Prof. Dr.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'Dr. h.c.',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  vi: {
    [ACADEMIC_TITLE_KEYS.DR]: 'TS.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'GS.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'GS.TS.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'TS. danh dự',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  },
  th: {
    [ACADEMIC_TITLE_KEYS.DR]: 'ดร.',
    [ACADEMIC_TITLE_KEYS.PROF]: 'ศ.',
    [ACADEMIC_TITLE_KEYS.PROF_DR]: 'ศ.ดร.',
    [ACADEMIC_TITLE_KEYS.DR_HC]: 'ดร.กิตติมศักดิ์',
    [ACADEMIC_TITLE_KEYS.NONE]: ''
  }
}; 