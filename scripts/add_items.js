const fs = require('fs').promises;
const path = require('path');

async function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      await deepMerge(target[key], source[key]);
    } else {
      // Only update if the key doesn't exist in target
      if (!(key in target)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

async function mergeLocales(combinedFilePath, outputDir) {
  try {
    // Read the combined JSON file
    const rawData = await fs.readFile(combinedFilePath, 'utf8');
    const combinedLocales = JSON.parse(rawData);

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Get all languages from the first key's structure
    const firstKey = Object.keys(combinedLocales)[0];
    const languages = Object.keys(combinedLocales[firstKey]);

    // Initialize language objects
    const languageObjects = {};
    languages.forEach(lang => {
      languageObjects[lang] = {};
    });

    // Restructure the new data for each language
    function restructureData(obj, currentPath = []) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = [...currentPath, key];
        
        if (value && typeof value === 'object' && !Object.keys(value).some(k => languages.includes(k))) {
          restructureData(value, newPath);
        } else if (value && typeof value === 'object' && languages.some(lang => lang in value)) {
          languages.forEach(lang => {
            if (value[lang]) {
              let current = languageObjects[lang];
              for (let i = 0; i < newPath.length - 1; i++) {
                if (!current[newPath[i]]) {
                  current[newPath[i]] = {};
                }
                current = current[newPath[i]];
              }
              current[newPath[newPath.length - 1]] = value[lang];
            }
          });
        }
      });
    }

    restructureData(combinedLocales);

    // Merge with existing files
    for (const lang of languages) {
      const filePath = path.join(outputDir, `${lang}.json`);
      let existingData = {};
      
      try {
        // Try to read existing file
        const existingContent = await fs.readFile(filePath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (error) {
        // File doesn't exist or is invalid, use empty object
        console.log(`Creating new file for ${lang}`);
      }

      // Merge existing data with new translations
      const mergedData = await deepMerge(existingData, languageObjects[lang]);

      // Write merged file
      await fs.writeFile(
        filePath,
        JSON.stringify(mergedData, null, 2),
        'utf8'
      );
      console.log(`Updated ${lang}.json`);
    }

    console.log('Successfully merged new translations into locale files!');
  } catch (error) {
    console.error('Error processing locales:', error);
  }
}

// Example usage:
if (require.main === module) {
  const combinedFilePath = process.argv[2];
  const outputDir = process.argv[3];

  if (!combinedFilePath || !outputDir) {
    console.error('Usage: node mergeLocales.js <combinedFilePath> <outputDir>');
    process.exit(1);
  }

  mergeLocales(combinedFilePath, outputDir);
}

module.exports = mergeLocales;