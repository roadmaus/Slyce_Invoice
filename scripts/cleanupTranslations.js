const fs = require('fs');
const path = require('path');

const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];

// Translations for each language
const translations = {
  customers: {
    businessCustomer: {
      en: "Business Customer",
      de: "Geschäftskunde",
      es: "Cliente comercial",
      ko: "기업 고객",
      fr: "Client professionnel",
      zh: "企业客户",
      ja: "法人顧客",
      pt: "Cliente empresarial",
      ru: "Корпоративный клиент",
      hi: "व्यावसायिक ग्राहक",
      ar: "عميل تجاري",
      it: "Cliente aziendale",
      nl: "Zakelijke klant",
      tr: "Kurumsal Müşteri",
      vi: "Khách hàng doanh nghiệp",
      th: "ลูกค้าธุรกิจ",
      swg: "Gschäftskond"
    }
  },
  business: {
    vatEnabled: {
      en: "VAT enabled ({{rate}}%)",
      de: "Umsatzsteuer aktiviert ({{rate}}%)",
      es: "IVA activado ({{rate}}%)",
      ko: "부가가치세 활성화 ({{rate}}%)",
      fr: "TVA activée ({{rate}}%)",
      zh: "已启用增值税 ({{rate}}%)",
      ja: "消費税有効 ({{rate}}%)",
      pt: "IVA ativado ({{rate}}%)",
      ru: "НДС включен ({{rate}}%)",
      hi: "जीएसटी सक्षम ({{rate}}%)",
      ar: "ضريبة القيمة المضافة مفعلة ({{rate}}%)",
      it: "IVA abilitata ({{rate}}%)",
      nl: "BTW ingeschakeld ({{rate}}%)",
      tr: "KDV etkin ({{rate}}%)",
      vi: "Đã bật VAT ({{rate}}%)",
      th: "เปิดใช้งาน VAT ({{rate}}%)",
      swg: "Mehrwertsteuer drzua ({{rate}}%)"
    },
    vatDisabled: {
      en: "VAT disabled",
      de: "Umsatzsteuer deaktiviert",
      es: "IVA desactivado",
      ko: "부가가치세 비활성화",
      fr: "TVA désactivée",
      zh: "已禁用增值税",
      ja: "消費税無効",
      pt: "IVA desativado",
      ru: "НДС отключен",
      hi: "जीएसटी अक्षम",
      ar: "ضريبة القيمة المضافة معطلة",
      it: "IVA disabilitata",
      nl: "BTW uitgeschakeld",
      tr: "KDV devre dışı",
      vi: "Đã tắt VAT",
      th: "ปิดใช้งาน VAT",
      swg: "Mehrwertsteuer weag"
    }
  },
  tags: {
    form: {
      noDescription: {
        en: "No description available",
        de: "Keine Beschreibung verfügbar",
        es: "Sin descripción disponible",
        ko: "설명 없음",
        fr: "Aucune description disponible",
        zh: "暂无描述",
        ja: "説明なし",
        pt: "Nenhuma descrição disponível",
        ru: "Описание отсутствует",
        hi: "कोई विवरण उपलब्ध नहीं",
        ar: "لا يوجد وصف متاح",
        it: "Nessuna descrizione disponibile",
        nl: "Geen beschrijving beschikbaar",
        tr: "Açıklama mevcut değil",
        vi: "Không có mô tả",
        th: "ไม่มีคำอธิบาย",
        swg: "Koi Beschreibung do"
      }
    }
  }
};

function cleanupFile(locale) {
  const filePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', `${locale}.json`);
  
  try {
    // Read and parse the file
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Fix business section
    if (content.business) {
      content.business.vatEnabled = translations.business.vatEnabled[locale] || translations.business.vatEnabled.en;
      content.business.vatDisabled = translations.business.vatDisabled[locale] || translations.business.vatDisabled.en;
    }
    
    // Fix customers section
    if (content.customers) {
      content.customers.businessCustomer = translations.customers.businessCustomer[locale] || translations.customers.businessCustomer.en;
    }
    
    // Fix tags section
    if (content.tags?.form) {
      content.tags.form.noDescription = translations.tags.form.noDescription[locale] || translations.tags.form.noDescription.en;
    }
    
    // Write the cleaned up file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✅ Cleaned up ${locale}.json`);
  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

// Process all locale files
locales.forEach(cleanupFile); 