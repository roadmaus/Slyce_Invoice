const fs = require('fs');
const path = require('path');

// Define all supported locales
const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];

// New translations to add
const newTranslations = {
  customers: {
    businessCustomer: {
      en: "Business Customer",
      de: "Geschäftskunde",
      swg: "Gschäftskond" // Swabian translation
      // Other languages will fall back to English
    }
  },
  business: {
    vatEnabled: {
      en: "VAT enabled ({{rate}}%)",
      de: "Umsatzsteuer aktiviert ({{rate}}%)",
      swg: "Mehrwertsteuer drzua ({{rate}}%)" // Swabian translation
    },
    vatDisabled: {
      en: "VAT disabled",
      de: "Umsatzsteuer deaktiviert",
      swg: "Mehrwertsteuer weag" // Swabian translation
    }
  },
  tags: {
    dialog: {
      addTitle: {
        en: "Add New Tag",
        de: "Neuen Tag hinzufügen",
        swg: "Nuis Schild drzua doa" // Swabian translation
      },
      editTitle: {
        en: "Edit Tag",
        de: "Tag bearbeiten",
        swg: "'s Schild ändern" // Swabian translation
      },
      addDescription: {
        en: "Create a new tag for quick entry",
        de: "Erstellen Sie einen neuen Tag für die Schnelleingabe",
        swg: "A nuis Schild macha zom schneller schreiba" // Swabian translation
      },
      editDescription: {
        en: "Edit the tag details",
        de: "Bearbeiten Sie die Details des Tags",
        swg: "D'Details vom Schild ändern" // Swabian translation
      }
    },
    form: {
      noDescription: {
        en: "No description available",
        de: "Keine Beschreibung verfügbar",
        swg: "Koi Beschreibung do" // Swabian translation
      }
    }
  }
};

// Function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

// Function to get translation for a specific locale
function getTranslationForLocale(translations, locale) {
  return translations[locale] || translations['en']; // Fallback to English if no specific translation
}

// Function to add translations to a specific locale
function addTranslationsToLocale(locale) {
  const filePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', `${locale}.json`);
  
  try {
    // Read existing translations
    let existingContent = {};
    try {
      existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.log(`Creating new file for ${locale}`);
    }
    
    // Create new translations for this locale
    const localeTranslations = {};
    for (const section in newTranslations) {
      localeTranslations[section] = localeTranslations[section] || {};
      for (const key in newTranslations[section]) {
        if (typeof newTranslations[section][key] === 'object' && !Array.isArray(newTranslations[section][key])) {
          // Handle nested objects
          localeTranslations[section][key] = {};
          for (const nestedKey in newTranslations[section][key]) {
            if (typeof newTranslations[section][key][nestedKey] === 'object') {
              localeTranslations[section][key][nestedKey] = getTranslationForLocale(newTranslations[section][key][nestedKey], locale);
            } else {
              localeTranslations[section][key][nestedKey] = newTranslations[section][key][nestedKey];
            }
          }
        } else {
          // Handle direct translations
          localeTranslations[section][key] = getTranslationForLocale(newTranslations[section][key], locale);
        }
      }
    }
    
    // Merge with existing translations
    const updatedContent = deepMerge(existingContent, localeTranslations);
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2));
    console.log(`✅ Updated ${locale}.json successfully`);
  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

// Create locales directory if it doesn't exist
const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

// Main execution
locales.forEach(addTranslationsToLocale);