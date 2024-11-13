const fs = require('fs');
const path = require('path');

const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];
const translationsPath = path.join(__dirname, '../src/i18n/locales');

// Default English message
const defaultMessage = 'Preview setting updated successfully';

// Messages for all languages
const messages = {
  en: 'Preview setting updated successfully',
  de: 'Vorschau-Einstellung erfolgreich aktualisiert',
  es: 'Configuración de vista previa actualizada correctamente',
  ko: '미리보기 설정이 성공적으로 업데이트되었습니다',
  fr: 'Paramètre d\'aperçu mis à jour avec succès',
  zh: '预览设置已成功更新',
  ja: 'プレビュー設定が正常に更新されました',
  pt: 'Configuração de pré-visualização atualizada com sucesso',
  ru: 'Настройки предварительного просмотра успешно обновлены',
  hi: 'पूर्वावलोकन सेटिंग सफलतापूर्वक अपडेट की गई',
  ar: 'تم تحديث إعداد المعاينة بنجاح',
  it: 'Impostazione anteprima aggiornata con successo',
  nl: 'Voorbeeldweergave-instelling succesvol bijgewerkt',
  tr: 'Önizleme ayarı başarıyla güncellendi',
  vi: 'Cập nhật cài đặt xem trước thành công',
  th: 'อัปเดตการตั้งค่าการแสดงตัวอย่างสำเร็จแล้ว',
  swg: 'Vorschau-Eistellong erfolgreich aktualisiert' // Swabian dialect
};

function updateTranslationFiles() {
  locales.forEach(locale => {
    const filePath = path.join(translationsPath, `${locale}.json`);
    
    try {
      // Read existing translation file
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      // Ensure nested structure exists
      if (!translations.settings) translations.settings = {};
      if (!translations.settings.success) translations.settings.success = {};
      
      // Only add if key doesn't exist
      if (!translations.settings.success.previewToggle) {
        translations.settings.success.previewToggle = messages[locale] || defaultMessage;
        
        // Write back to file with proper formatting
        fs.writeFileSync(
          filePath, 
          JSON.stringify(translations, null, 2),
          'utf8'
        );
        
        console.log(`✅ Updated ${locale}.json`);
      } else {
        console.log(`ℹ️ Key already exists in ${locale}.json`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${locale}.json:`, error.message);
    }
  });
}

updateTranslationFiles();
