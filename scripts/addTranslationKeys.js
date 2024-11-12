const fs = require('fs');
const path = require('path');

// New translations to add
const newTranslations = {
  customers: {
    businessCustomer: {
      en: "Business Customer",
      de: "Geschäftskunde"
    }
  },
  business: {
    vatEnabled: {
      en: "VAT enabled ({{rate}}%)",
      de: "Umsatzsteuer aktiviert ({{rate}}%)"
    },
    vatDisabled: {
      en: "VAT disabled",
      de: "Umsatzsteuer deaktiviert"
    }
  },
  tags: {
    dialog: {
      addTitle: {
        en: "Add New Tag",
        de: "Neuen Tag hinzufügen"
      },
      editTitle: {
        en: "Edit Tag",
        de: "Tag bearbeiten"
      },
      addDescription: {
        en: "Create a new tag for quick entry",
        de: "Erstellen Sie einen neuen Tag für die Schnelleingabe"
      },
      editDescription: {
        en: "Edit the tag details",
        de: "Bearbeiten Sie die Details des Tags"
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

// Function to add translations to a specific locale
function addTranslationsToLocale(locale) {
  const filePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', `${locale}.json`);
  
  try {
    // Read existing translations
    const existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Create new translations for this locale
    const localeTranslations = {};
    for (const section in newTranslations) {
      localeTranslations[section] = {};
      for (const key in newTranslations[section]) {
        if (typeof newTranslations[section][key] === 'object' && !newTranslations[section][key][locale]) {
          // Handle nested objects
          localeTranslations[section][key] = {};
          for (const nestedKey in newTranslations[section][key]) {
            localeTranslations[section][key][nestedKey] = newTranslations[section][key][nestedKey][locale];
          }
        } else {
          // Handle direct translations
          localeTranslations[section][key] = newTranslations[section][key][locale];
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

// Main execution
const locales = ['en', 'de']; // Add more locales as needed
locales.forEach(addTranslationsToLocale); 