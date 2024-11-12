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
    },
    emptyState: {
      title: {
        en: "No Customers Available",
        de: "Keine Kunden verfügbar",
        es: "No hay clientes disponibles",
        ko: "고객이 없습니다",
        fr: "Aucun client disponible",
        zh: "暂无客户",
        ja: "顧客がいません",
        pt: "Nenhum cliente disponível",
        ru: "Нет доступных клиентов",
        hi: "कोई ग्राहक उपलब्ध नहीं",
        ar: "لا يوجد عملاء متاحين",
        it: "Nessun cliente disponibile",
        nl: "Geen klanten beschikbaar",
        tr: "Müşteri bulunmamakta",
        vi: "Không có khách hàng",
        th: "ไม่มีลูกค้า",
        swg: "Koine Konda do"
      },
      description: {
        en: "Add your first customer to get started with creating invoices.",
        de: "Fügen Sie Ihren ersten Kunden hinzu, um mit der Rechnungserstellung zu beginnen.",
        es: "Agregue su primer cliente para comenzar a crear facturas.",
        ko: "첫 번째 고객을 추가하여 청구서 작성을 시작하세요.",
        fr: "Ajoutez votre premier client pour commencer à créer des factures.",
        zh: "添加您的第一个客户以开始创建发票。",
        ja: "最初の顧客を追加して請求書の作成を始めましょう。",
        pt: "Adicione seu primeiro cliente para começar a criar faturas.",
        ru: "Добавьте своего первого клиента, чтобы начать создавать счета.",
        hi: "बिल बनाना शुरू करने के लिए अपना पहला ग्राहक जोड़ें।",
        ar: "أضف عميلك الأول للبدء في إنشاء الفواتير.",
        it: "Aggiungi il tuo primo cliente per iniziare a creare fatture.",
        nl: "Voeg uw eerste klant toe om te beginnen met het maken van facturen.",
        tr: "Fatura oluşturmaya başlamak için ilk müşterinizi ekleyin.",
        vi: "Thêm khách hàng đầu tiên để bắt đầu tạo hóa đơn.",
        th: "เพิ่มลูกค้าคนแรกของคุณเพื่อเริ่มสร้างใบแจ้งหนี้",
        swg: "Füag dein erschta Kond drzua zum mit Rechnunga afanga."
      },
      addFirst: {
        en: "Add First Customer",
        de: "Ersten Kunden hinzufügen",
        es: "Agregar primer cliente",
        ko: "첫 고객 추가",
        fr: "Ajouter le premier client",
        zh: "添加第一个客户",
        ja: "最初の顧客を追加",
        pt: "Adicionar primeiro cliente",
        ru: "Добавить первого клиента",
        hi: "पहला ग्राहक जोड़ें",
        ar: "إضافة أول عميل",
        it: "Aggiungi primo cliente",
        nl: "Eerste klant toevoegen",
        tr: "İlk müşteriyi ekle",
        vi: "Thêm khách hàng đầu tiên",
        th: "เพิ่มลูกค้าคนแรก",
        swg: "Erschta Kond drzuadoa"
      }
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
    },
    emptyState: {
      title: {
        en: "No Business Profiles",
        de: "Keine Geschäftsprofile",
        es: "Sin perfiles de negocio",
        ko: "비즈니스 프로필 없음",
        fr: "Aucun profil d'entreprise",
        zh: "没有业务档案",
        ja: "ビジネスプロファイルがありません",
        pt: "Sem perfis empresariais",
        ru: "Нет бизнес-профилей",
        hi: "कोई व्यवसाय प्रोफ़ाइल नहीं",
        ar: "لا توجد ملفات تعريف تجارية",
        it: "Nessun profilo aziendale",
        nl: "Geen bedrijfsprofielen",
        tr: "İş profili yok",
        vi: "Không có hồ sơ doanh nghiệp",
        th: "ไม่มีโปรไฟล์ธุรกิจ",
        swg: "Koine Gschäftsprofil"
      },
      description: {
        en: "Add your first business profile to start creating invoices.",
        de: "Fügen Sie Ihr erstes Geschäftsprofil hinzu, um mit der Rechnungserstellung zu beginnen.",
        es: "Agregue su primer perfil de negocio para comenzar a crear facturas.",
        ko: "첫 번째 비즈니스 프로필을 추가하여 청구서 작성을 시작하세요.",
        fr: "Ajoutez votre premier profil d'entreprise pour commencer à créer des factures.",
        zh: "添加您的第一个业务档案以开始创建发票。",
        ja: "最初のビジネスプロファイルを追加して請求書の作成を始めましょう。",
        pt: "Adicione seu primeiro perfil empresarial para começar a criar faturas.",
        ru: "Добавьте свой первый бизнес-профиль, чтобы начать создавать счета.",
        hi: "बिल बनाना शुरू करने के लिए अपनी पहली व्यवसाय प्रोफ़ाइल जोड़ें।",
        ar: "أضف ملف تعريف عملك الأول لبدء إنشاء الفواتير.",
        it: "Aggiungi il tuo primo profilo aziendale per iniziare a creare fatture.",
        nl: "Voeg uw eerste bedrijfsprofiel toe om te beginnen met factureren.",
        tr: "Fatura oluşturmaya başlamak için ilk iş profilinizi ekleyin.",
        vi: "Thêm hồ sơ doanh nghiệp đầu tiên để bắt đầu tạo hóa đơn.",
        th: "เพิ่มโปรไฟล์ธุรกิจแรกของคุณเพื่อเริ่มสร้างใบแจ้งหนี้",
        swg: "Füag dei erschtes Gschäftsprofil drzua zum mit Rechnunga afanga."
      },
      addFirst: {
        en: "Add First Business Profile",
        de: "Erstes Geschäftsprofil hinzufügen",
        es: "Agregar primer perfil de negocio",
        ko: "첫 비즈니스 프로필 추가",
        fr: "Ajouter le premier profil d'entreprise",
        zh: "添加第一个业务档案",
        ja: "最初のビジネスプロファイルを追加",
        pt: "Adicionar primeiro perfil empresarial",
        ru: "Добавить первый бизнес-профиль",
        hi: "पहली व्यवसाय प्रोफ़ाइल जोड़ें",
        ar: "إضافة أول ملف تعريف تجاري",
        it: "Aggiungi primo profilo aziendale",
        nl: "Eerste bedrijfsprofiel toevoegen",
        tr: "İlk iş profilini ekle",
        vi: "Thêm hồ sơ doanh nghiệp đầu tiên",
        th: "เพิ่มโปรไฟล์ธุรกิจแรก",
        swg: "Erschtes Gschäftsprofil drzuadoa"
      }
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
    if (!content.customers) {
      content.customers = {};
    }
    
    content.customers.businessCustomer = translations.customers.businessCustomer[locale] || translations.customers.businessCustomer.en;
    
    // Add emptyState if not present
    if (!content.customers.emptyState) {
      content.customers.emptyState = {};
    }
    
    // Add new translations only if they don't exist
    if (!content.customers.emptyState.title) {
      content.customers.emptyState.title = translations.customers.emptyState.title[locale] || translations.customers.emptyState.title.en;
    }
    if (!content.customers.emptyState.description) {
      content.customers.emptyState.description = translations.customers.emptyState.description[locale] || translations.customers.emptyState.description.en;
    }
    if (!content.customers.emptyState.addFirst) {
      content.customers.emptyState.addFirst = translations.customers.emptyState.addFirst[locale] || translations.customers.emptyState.addFirst.en;
    }
    
    // Fix tags section
    if (content.tags?.form) {
      content.tags.form.noDescription = translations.tags.form.noDescription[locale] || translations.tags.form.noDescription.en;
    }
    
    // Fix business section
    if (!content.business) {
      content.business = {};
    }
    
    // Add emptyState if not present
    if (!content.business.emptyState) {
      content.business.emptyState = {};
    }
    
    // Add new translations only if they don't exist
    if (!content.business.emptyState.title) {
      content.business.emptyState.title = translations.business.emptyState.title[locale] || translations.business.emptyState.title.en;
    }
    if (!content.business.emptyState.description) {
      content.business.emptyState.description = translations.business.emptyState.description[locale] || translations.business.emptyState.description.en;
    }
    if (!content.business.emptyState.addFirst) {
      content.business.emptyState.addFirst = translations.business.emptyState.addFirst[locale] || translations.business.emptyState.addFirst.en;
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