const fs = require('fs');
const path = require('path');

// Base translations to add if missing
const baseTranslations = {
    settings: {
      language: {
        invoiceLanguage: {
          ar: "لغة الفاتورة",
          de: "Rechnungssprache",
          en: "Invoice Language",
          es: "Idioma de la factura",
          fr: "Langue de facturation",
          hi: "चालान भाषा",
          it: "Lingua fattura",
          ja: "請求書の言語",
          ko: "청구서 언어",
          nl: "Factuur taal",
          pt: "Idioma da fatura",
          ru: "Язык счета",
          swg: "Rechnongschproch",
          th: "ภาษาใบแจ้งหนี้",
          tr: "Fatura Dili",
          vi: "Ngôn ngữ hóa đơn",
          zh: "发票语言"
        },
        invoiceLanguageDescription: {
          ar: "اختر اللغة المستخدمة للفواتير المنشأة. 'تلقائي' سيحاول استخدام اللغة المحلية للعميل.",
          de: "Wählen Sie die Sprache für generierte Rechnungen. 'Automatisch' versucht, die regionale Sprache des Kunden zu verwenden.",
          en: "Choose the language for generated invoices. 'Automatic' will attempt to use the customer's regional language.",
          es: "Elija el idioma para las facturas generadas. 'Automático' intentará usar el idioma regional del cliente.",
          fr: "Choisissez la langue pour les factures générées. 'Automatique' tentera d'utiliser la langue régionale du client.",
          hi: "उत्पन्न चालान के लिए भाषा चुनें। 'स्वचालित' ग्राहक की क्षेत्रीय भाषा का उपयोग करने का प्रयास करेगा।",
          it: "Scegli la lingua per le fatture generate. 'Automatico' tenterà di utilizzare la lingua regionale del cliente.",
          ja: "生成される請求書の言語を選択してください。「自動」は顧客の地域言語を使用しようとします。",
          ko: "생성된 청구서의 언어를 선택하세요. '자동'은 고객의 지역 언어를 사용하려고 시도합니다.",
          nl: "Kies de taal voor gegenereerde facturen. 'Automatisch' probeert de regionale taal van de klant te gebruiken.",
          pt: "Escolha o idioma para faturas geradas. 'Automático' tentará usar o idioma regional do cliente.",
          ru: "Выберите язык для создаваемых счетов. 'Автоматически' попытается использовать региональный язык клиента.",
          swg: "Wählet d'Schproch für d'Rechnonga. 'Automatisch' versuacht d'regional Schproch vom Kond z'nemma.",
          th: "เลือกภาษาสำหรับใบแจ้งหนี้ที่สร้างขึ้น 'อัตโนมัติ' จะพยายามใช้ภาษาท้องถิ่นของลูกค้า",
          tr: "Oluşturulan faturalar için dil seçin. 'Otomatik', müşterinin bölgesel dilini kullanmayı deneyecektir.",
          vi: "Chọn ngôn ngữ cho hóa đơn được tạo. 'Tự động' sẽ cố gắng sử dụng ngôn ngữ khu vực của khách hàng.",
          zh: "选择生成发票的语言。\"自动\"将尝试使用客户的区域语言。"
        },
        invoiceLanguages: {
          auto: {
            ar: "تلقائي",
            de: "Automatisch",
            en: "Automatic",
            es: "Automático",
            fr: "Automatique",
            hi: "स्वचालित",
            it: "Automatico",
            ja: "自動",
            ko: "자동",
            nl: "Automatisch",
            pt: "Automático",
            ru: "Автоматически",
            swg: "Automatisch",
            th: "อัตโนมัติ",
            tr: "Otomatik",
            vi: "Tự động",
            zh: "自动"
          }
        }
      },
      success: {
        invoiceLanguage: {
          ar: "تم تحديث لغة الفاتورة بنجاح",
          de: "Rechnungssprache erfolgreich aktualisiert",
          en: "Invoice language successfully updated",
          es: "Idioma de factura actualizado exitosamente",
          fr: "Langue de facturation mise à jour avec succès",
          hi: "चालान भाषा सफलतापूर्वक अपडेट की गई",
          it: "Lingua fattura aggiornata con successo",
          ja: "請求書の言語が正常に更新されました",
          ko: "청구서 언어가 성공적으로 업데이트되었습니다",
          nl: "Factuurtaal succesvol bijgewerkt",
          pt: "Idioma da fatura atualizado com sucesso",
          ru: "Язык счета успешно обновлен",
          swg: "Rechnongschproch erfolgreich aktualisiert",
          th: "อัปเดตภาษาใบแจ้งหนี้สำเร็จ",
          tr: "Fatura dili başarıyla güncellendi",
          vi: "Cập nhật ngôn ngữ hóa đơn thành công",
          zh: "发票语言更新成功"
        },
        currency: {
          ar: "تم تحديث العملة بنجاح",
          de: "Währung erfolgreich aktualisiert",
          en: "Currency successfully updated",
          es: "Moneda actualizada exitosamente",
          fr: "Devise mise à jour avec succès",
          hi: "मुद्रा सफलतापूर्वक अपडेट की गई",
          it: "Valuta aggiornata con successo",
          ja: "通貨が正常に更新されました",
          ko: "통화가 성공적으로 업데이트되었습니다",
          nl: "Valuta succesvol bijgewerkt",
          pt: "Moeda atualizada com sucesso",
          ru: "Валюта успешно обновлена",
          swg: "Währong erfolgreich aktualisiert",
          th: "อัปเดตสกุลเงินสำเร็จ",
          tr: "Para birimi başarıyla güncellendi",
          vi: "Cập nhật tiền tệ thành công",
          zh: "货币更新成功"
        }
      }
    }
  };
// Function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      if (!target[key]) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// Function to update locale files
async function updateLocaleFiles() {
  // Updated path to match your project structure
  const localesDir = path.join(__dirname, '../src/i18n/locales');
  const files = fs.readdirSync(localesDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const locale = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    
    try {
      // Read existing translations
      const content = fs.readFileSync(filePath, 'utf8');
      const existingTranslations = JSON.parse(content);

      // Create new translations object with the base structure
      const newTranslations = deepMerge(existingTranslations, baseTranslations);

      // Write back to file with pretty formatting
      fs.writeFileSync(
        filePath, 
        JSON.stringify(newTranslations, null, 2),
        'utf8'
      );

      console.log(`✅ Updated ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
}

// Run the update
updateLocaleFiles().catch(console.error);
