const fs = require('fs');
const path = require('path');

const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];

    // Write the cleaned up file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✅ Cleaned up ${locale}.json`);
  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

// Process all locale files
locales.forEach(cleanupFile); 