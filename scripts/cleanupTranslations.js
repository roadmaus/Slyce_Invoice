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
  },
  settings: {
    templateEditor: {
      en: "Template Editor",
      de: "Vorlageneditor",
      es: "Editor de plantillas",
      ko: "템플릿 편집기",
      fr: "Éditeur de modèle",
      zh: "模板编辑器",
      ja: "テンプレートエディタ",
      pt: "Editor de modelo",
      ru: "Редактор шаблонов",
      hi: "टेम्पलेट एडिटर",
      ar: "محرر القالب",
      it: "Editor di modelli",
      nl: "Sjablooneditor",
      tr: "Şablon Düzenleyici",
      vi: "Trình chỉnh sửa mẫu",
      th: "ตัวแก้ไขเทมเพลต",
      swg: "Vorlaga-Editor"
    },
    actions: {
      reset: {
        en: "Reset",
        de: "Zurücksetzen",
        es: "Restablecer",
        ko: "초기화",
        fr: "Réinitialiser",
        zh: "重置",
        ja: "リセット",
        pt: "Redefinir",
        ru: "Сбросить",
        hi: "रीसेट",
        ar: "إعادة تعيين",
        it: "Ripristina",
        nl: "Herstellen",
        tr: "Sıfırla",
        vi: "Đặt lại",
        th: "รีเซ็ต",
        swg: "Zrucksetzn"
      },
      save: {
        en: "Save",
        de: "Speichern",
        es: "Guardar",
        ko: "저장",
        fr: "Enregistrer",
        zh: "保存",
        ja: "保存",
        pt: "Salvar",
        ru: "Сохранить",
        hi: "सहेजें",
        ar: "حفظ",
        it: "Salva",
        nl: "Opslaan",
        tr: "Kaydet",
        vi: "Lưu",
        th: "บันทึก",
        swg: "Speichra"
      },
      close: {
        en: "Close",
        de: "Schließen",
        es: "Cerrar",
        ko: "닫기",
        fr: "Fermer",
        zh: "关闭",
        ja: "閉じる",
        pt: "Fechar",
        ru: "Закрыть",
        hi: "बंद करें",
        ar: "إغلاق",
        it: "Chiudi",
        nl: "Sluiten",
        tr: "Kapat",
        vi: "Đóng",
        th: "ปิด",
        swg: "Zuamacha"
      },
      editTemplate: {
        en: "Edit Template",
        de: "Vorlage bearbeiten",
        es: "Editar plantilla",
        ko: "템플릿 편집",
        fr: "Modifier le modèle",
        zh: "编辑模板",
        ja: "テンプレートを編集",
        pt: "Editar modelo",
        ru: "Редактировать шаблон",
        hi: "टेम्पलेट संपादित करें",
        ar: "تحرير القالب",
        it: "Modifica modello",
        nl: "Sjabloon bewerken",
        tr: "Şablonu düzenle",
        vi: "Chỉnh sửa mẫu",
        th: "แก้ไขเทมเพลต",
        swg: "Vorlag bearbeita"
      }
    },
    errors: {
      templateLoad: {
        en: "Error loading template",
        de: "Fehler beim Laden der Vorlage",
        es: "Error al cargar la plantilla",
        ko: "템플릿 로드 오류",
        fr: "Erreur lors du chargement du modèle",
        zh: "加载模板时出错",
        ja: "テンプレートの読み込みエラー",
        pt: "Erro ao carregar modelo",
        ru: "Ошибка загрузки шаблона",
        hi: "टेम्पलेट लोड करने में त्रुटि",
        ar: "خطأ في تحميل القالب",
        it: "Errore nel caricamento del modello",
        nl: "Fout bij laden sjabloon",
        tr: "Şablon yüklenirken hata oluştu",
        vi: "Lỗi khi tải mẫu",
        th: "เกิดข้อผิดพลาดในการโหลดเทมเพลต",
        swg: "Fehler beim Lada von dr Vorlag"
      },
      templateSave: {
        en: "Error saving template",
        de: "Fehler beim Speichern der Vorlage",
        es: "Error al guardar la plantilla",
        ko: "템플릿 저장 오류",
        fr: "Erreur lors de l'enregistrement du modèle",
        zh: "保存模板时出错",
        ja: "テンプレートの保存エラー",
        pt: "Erro ao salvar modelo",
        ru: "Ошибка сохранения шаблона",
        hi: "टेम्पलेट सहेजने में त्रुटि",
        ar: "خطأ في حفظ القالب",
        it: "Errore nel salvataggio del modello",
        nl: "Fout bij opslaan sjabloon",
        tr: "Şablon kaydedilirken hata oluştu",
        vi: "Lỗi khi lưu mẫu",
        th: "เกิดข้อผิดพลาดในการบันทึกเทมเพลต",
        swg: "Fehler beim Speichra von dr Vorlag"
      },
      templateReset: {
        en: "Error resetting template",
        de: "Fehler beim Zurücksetzen der Vorlage",
        es: "Error al restablecer la plantilla",
        ko: "템플릿 초기화 오류",
        fr: "Erreur lors de la réinitialisation du modèle",
        zh: "重置模板时出错",
        ja: "テンプレートのリセットエラー",
        pt: "Erro ao redefinir modelo",
        ru: "Ошибка сброса шаблона",
        hi: "टेम्पलेट रीसेट करने में त्रुटि",
        ar: "خطأ في إعادة تعيين القالب",
        it: "Errore nel ripristino del modello",
        nl: "Fout bij herstellen sjabloon",
        tr: "Şablon sıfırlanırken hata oluştu",
        vi: "Lỗi khi đặt lại mẫu",
        th: "เกิดข้อผิดพลาดในการรีเซ็ตเทมเพลต",
        swg: "Fehler beim Zrucksetzn von dr Vorlag"
      }
    },
    success: {
      templateSave: {
        en: "Template saved successfully",
        de: "Vorlage erfolgreich gespeichert",
        es: "Plantilla guardada con éxito",
        ko: "템플릿이 성공적으로 저장됨",
        fr: "Modèle enregistré avec succès",
        zh: "模板保存成功",
        ja: "テンプレートを保存しました",
        pt: "Modelo salvo com sucesso",
        ru: "Шаблон успешно сохранен",
        hi: "टेम्पलेट सफलतापूर्वक सहेजा गया",
        ar: "تم حفظ القالب بنجاح",
        it: "Modello salvato con successo",
        nl: "Sjabloon succesvol opgeslagen",
        tr: "Şablon başarıyla kaydedildi",
        vi: "Đã lưu mẫu thành công",
        th: "บันทึกเทมเพลตสำเร็จ",
        swg: "Vorlag erfolgreich gspeichert"
      },
      templateReset: {
        en: "Template reset successfully",
        de: "Vorlage erfolgreich zurückgesetzt",
        es: "Plantilla restablecida con éxito",
        ko: "템플릿이 성공적으로 초기화됨",
        fr: "Modèle réinitialisé avec succès",
        zh: "模板重置成功",
        ja: "テンプレートをリセットしました",
        pt: "Modelo redefinido com sucesso",
        ru: "Шаблон успешно сброшен",
        hi: "टेम्पलेट सफलतापूर्वक रीसेट किया गया",
        ar: "تم إعادة تعيين القالب بنجاح",
        it: "Modello ripristinato con successo",
        nl: "Sjabloon succesvol hersteld",
        tr: "Şablon başarıyla sıfırlandı",
        vi: "Đã đặt lại mẫu thành công",
        th: "รีเซ็ตเทมเพลตสำเร็จ",
        swg: "Vorlag erfolgreich zruckgsetzt"
      }
    },
    confirmations: {
      resetTemplate: {
        en: "Are you sure you want to reset the template? This action cannot be undone.",
        de: "Sind Sie sicher, dass Sie die Vorlage zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        es: "¿Está seguro de que desea restablecer la plantilla? Esta acción no se puede deshacer.",
        ko: "템플릿을 초기화하시겠습니까? 이 작업은 취소할 수 없습니다.",
        fr: "Êtes-vous sûr de vouloir réinitialiser le modèle ? Cette action ne peut pas être annulée.",
        zh: "您确定要重置模板吗？此操作无法撤消。",
        ja: "テンプレートをリセットしてもよろしいですか？この操作は元に戻せません。",
        pt: "Tem certeza de que deseja redefinir o modelo? Esta ação não pode ser desfeita.",
        ru: "Вы уверены, что хотите сбросить шаблон? Это действие нельзя отменить.",
        hi: "क्या आप वाकई टेम्पलेट को रीसेट करना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
        ar: "هل أنت متأكد أنك تريد إعادة تعيين القالب؟ لا يمكن التراجع عن هذا الإجراء.",
        it: "Sei sicuro di voler ripristinare il modello? Questa azione non può essere annullata.",
        nl: "Weet u zeker dat u het sjabloon wilt herstellen? Deze actie kan niet ongedaan worden gemaakt.",
        tr: "Şablonu sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
        vi: "Bạn có chắc chắn muốn đặt lại mẫu không? Hành động này không thể hoàn tác.",
        th: "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตเทมเพลต? การกระทำนี้ไม่สามารถยกเลิกได้",
        swg: "Bisch dr sichr, dass d'Vorlag zrucksetzn willsch? Des ka ma nemme ruckgängig macha."
      }
    },
    invoice: {
      template: {
        en: "Invoice Template",
        de: "Rechnungsvorlage",
        es: "Plantilla de factura",
        ko: "청구서 템플릿",
        fr: "Modèle de facture",
        zh: "发票模板",
        ja: "請求書テンプレート",
        pt: "Modelo de fatura",
        ru: "Шаблон счета",
        hi: "चालान टेम्पलेट",
        ar: "قالب الفاتورة",
        it: "Modello fattura",
        nl: "Factuursjabloon",
        tr: "Fatura şablonu",
        vi: "Mẫu hóa đơn",
        th: "เทมเพลตใบแจ้งหนี้",
        swg: "Rechnungsvorlag"
      },
      templateDescription: {
        en: "Customize your invoice template to match your brand",
        de: "Passen Sie Ihre Rechnungsvorlage an Ihre Marke an",
        es: "Personalice su plantilla de factura para que coincida con su marca",
        ko: "브랜드에 맞게 청구서 템플릿 사용자 지정",
        fr: "Personnalisez votre modèle de facture selon votre marque",
        zh: "自定义发票模板以匹配您的品牌",
        ja: "請求書テンプレートをブランドに合わせてカスタマイズ",
        pt: "Personalize seu modelo de fatura para corresponder à sua marca",
        ru: "Настройте шаблон счета в соответствии с вашим брендом",
        hi: "अपने ब्रांड से मेल खाने के लिए अपना चालान टेम्पलेट अनुकूलित करें",
        ar: "تخصيص قالب الفاتورة ليتناسب مع علامتك التجارية",
        it: "Personalizza il modello della fattura per abbinarlo al tuo marchio",
        nl: "Pas uw factuursjabloon aan uw merk aan",
        tr: "Fatura şablonunuzu markanıza uyacak şekilde özelleştirin",
        vi: "Tùy chỉnh mẫu hóa đơn để phù hợp với thương hiệu của bạn",
        th: "ปรับแต่งเทมเพลตใบแจ้งหนี้ให้ตรงกับแบรนด์ของคุณ",
        swg: "Bass deine Rechnungsvorlag an dei Marke a"
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
    
    // Add template editor related translations
    if (!content.settings) {
      content.settings = {};
    }

    content.settings.templateEditor = translations.settings.templateEditor[locale] || translations.settings.templateEditor.en;

    if (!content.settings.actions) {
      content.settings.actions = {};
    }
    content.settings.actions.reset = translations.settings.actions.reset[locale] || translations.settings.actions.reset.en;
    content.settings.actions.save = translations.settings.actions.save[locale] || translations.settings.actions.save.en;
    content.settings.actions.close = translations.settings.actions.close[locale] || translations.settings.actions.close.en;

    if (!content.settings.errors) {
      content.settings.errors = {};
    }
    content.settings.errors.templateLoad = translations.settings.errors.templateLoad[locale] || translations.settings.errors.templateLoad.en;
    content.settings.errors.templateSave = translations.settings.errors.templateSave[locale] || translations.settings.errors.templateSave.en;
    content.settings.errors.templateReset = translations.settings.errors.templateReset[locale] || translations.settings.errors.templateReset.en;

    if (!content.settings.success) {
      content.settings.success = {};
    }
    content.settings.success.templateSave = translations.settings.success.templateSave[locale] || translations.settings.success.templateSave.en;
    content.settings.success.templateReset = translations.settings.success.templateReset[locale] || translations.settings.success.templateReset.en;

    if (!content.settings.confirmations) {
      content.settings.confirmations = {};
    }
    content.settings.confirmations.resetTemplate = translations.settings.confirmations.resetTemplate[locale] || translations.settings.confirmations.resetTemplate.en;
    
    // Add invoice template related translations
    if (!content.settings.invoice) {
      content.settings.invoice = {};
    }
    content.settings.invoice.template = translations.settings.invoice.template[locale] || translations.settings.invoice.template.en;
    content.settings.invoice.templateDescription = translations.settings.invoice.templateDescription[locale] || translations.settings.invoice.templateDescription.en;
    
    // Add edit template action
    if (!content.settings.actions) {
      content.settings.actions = {};
    }
    content.settings.actions.editTemplate = translations.settings.actions.editTemplate[locale] || translations.settings.actions.editTemplate.en;
    
    // Write the cleaned up file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✅ Cleaned up ${locale}.json`);
  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

// Process all locale files
locales.forEach(cleanupFile); 