const fs = require('fs').promises;
const path = require('path');

async function transformAndMerge(combinedData) {
  // Create a map to store transformed data for each language
  const transformedData = {};
  
  function transformStructure(obj, currentPath = []) {
    if (!obj || typeof obj !== 'object') return;

    // Check if this object contains translations (has language keys)
    const possibleLanguages = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];
    const hasTranslations = Object.keys(obj).some(key => possibleLanguages.includes(key));

    if (hasTranslations) {
      // This is a leaf node with translations
      possibleLanguages.forEach(lang => {
        if (!transformedData[lang]) transformedData[lang] = {};
        
        let current = transformedData[lang];
        // Build the nested structure
        for (let i = 0; i < currentPath.length - 1; i++) {
          const pathKey = currentPath[i];
          if (!current[pathKey]) current[pathKey] = {};
          current = current[pathKey];
        }
        
        // Set the value at the leaf
        const lastKey = currentPath[currentPath.length - 1];
        current[lastKey] = obj[lang] || '';
      });
    } else {
      // Continue traversing the object
      Object.entries(obj).forEach(([key, value]) => {
        transformStructure(value, [...currentPath, key]);
      });
    }
  }

  // Start the transformation from the root
  transformStructure(combinedData, []);
  return transformedData;
}

async function mergeWithExisting(transformedData, localesDir) {
  // Ensure the locales directory exists
  await fs.mkdir(localesDir, { recursive: true });

  for (const lang of Object.keys(transformedData)) {
    const filePath = path.join(localesDir, `${lang}.json`);
    
    try {
      let existingData = {};
      
      // Try to read existing file
      try {
        const existingContent = await fs.readFile(filePath, 'utf8');
        existingData = JSON.parse(existingContent);
      } catch (error) {
        console.log(`Creating new file for language: ${lang}`);
      }

      // Deep merge the new translations with existing data
      const merged = deepMerge(existingData, transformedData[lang]);

      // Write back to file with proper formatting
      await fs.writeFile(
        filePath,
        JSON.stringify(merged, null, 2),
        'utf8'
      );
      
      console.log(`Updated ${lang}.json with new translations`);
    } catch (error) {
      console.error(`Error processing ${lang}.json:`, error);
    }
  }
}

function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!(key in target)) {
        output[key] = source[key];
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      // Only update if the source value is non-empty
      if (source[key] && (!target[key] || source[key].trim?.() !== '')) {
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

async function main() {
  try {
    const combinedFilePath = process.argv[2];
    const localesDir = process.argv[3];

    if (!combinedFilePath || !localesDir) {
      console.error('Usage: node mergeTranslations.js <combinedFilePath> <localesDir>');
      process.exit(1);
    }

    console.log('Reading combined translations file...');
    const rawData = await fs.readFile(combinedFilePath, 'utf8');
    const combinedData = JSON.parse(rawData);

    console.log('Transforming data structure...');
    const transformedData = await transformAndMerge(combinedData);

    console.log('Merging with existing translations...');
    await mergeWithExisting(transformedData, localesDir);

    console.log('Successfully merged all translations!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  transformAndMerge,
  mergeWithExisting,
  deepMerge
}; 