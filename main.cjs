// File: main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Store = require('electron-store');
const store = new Store();

if (process.platform === 'darwin') {
  app.applicationSupportsSecureRestorableState = () => true;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
      contentSecurityPolicy: {
        policy: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'blob:'],
          'font-src': ["'self'"],
          'connect-src': ["'self'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
          'frame-ancestors': ["'self'"],
          'worker-src': ["'self'"],
          'require-trusted-types-for': ["'script'"]
        }
      },
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173').catch((err) => {
        console.error('Failed to connect to dev server:', err);
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
      });
      mainWindow.webContents.openDevTools();
    }, 1000);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.webContents.on('did-fail-load', () => {
    console.error('Failed to load window content');
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

function registerIpcHandlers() {
  ipcMain.handle('dialog:selectDirectory', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Invoice Save Location',
        buttonLabel: 'Select Folder'
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return '';
    } catch (error) {
      console.error('Error selecting directory:', error);
      throw error;
    }
  });

  // Register IPC handlers
  ipcMain.handle('getData', async (event, key) => {
    return store.get(key);
  });

  ipcMain.handle('setData', async (event, key, data) => {
    store.set(key, data);
    return true;
  });

  ipcMain.handle('saveInvoice', async (event, pdfBuffer) => {
    const { filePath } = await dialog.showSaveDialog({
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, pdfBuffer);
      return true;
    }
    return false;
  });

  const getTemplateDirectory = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'templates');
  };

  const ensureTemplatesExist = () => {
    const templateDir = getTemplateDirectory();
    const defaultTemplatePath = path.join(templateDir, 'invoice_template.html');
    
    // Create template directory if it doesn't exist
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }
    
    // Copy all bundled templates if template directory is empty
    const bundledTemplatesDir = path.join(__dirname, 'src', 'templates');
    if (fs.existsSync(bundledTemplatesDir)) {
      const bundledTemplates = fs.readdirSync(bundledTemplatesDir);
      
      bundledTemplates.forEach(template => {
        const bundledPath = path.join(bundledTemplatesDir, template);
        const userPath = path.join(templateDir, template);
        
        if (!fs.existsSync(userPath)) {
          fs.copyFileSync(bundledPath, userPath);
        }
      });
    }
    
    // Ensure at least one template exists (use first template as default)
    const templates = fs.readdirSync(templateDir).filter(file => file.endsWith('.html'));
    if (templates.length === 0) {
      throw new Error('No templates found in templates directory');
    }
    
    // Set the first template as default if default doesn't exist
    if (!fs.existsSync(defaultTemplatePath)) {
      fs.copyFileSync(path.join(templateDir, templates[0]), defaultTemplatePath);
    }
    
    return defaultTemplatePath;
  };

  ipcMain.handle('getInvoiceTemplate', async () => {
    const templatePath = ensureTemplatesExist();
    return fs.readFileSync(templatePath, 'utf8');
  });

  ipcMain.handle('getTemplatePath', () => {
    return ensureTemplatesExist();
  });

  ipcMain.handle('save-invoice', async (event, pdfArrayBuffer, fileName) => {
    try {
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      
      // Get the settings from store
      const settings = store.get('previewSettings');
      const customPath = settings?.savePath;

      let savePath;
      if (customPath && customPath.trim() !== '') {
        // Use custom path if set and not empty
        const year = new Date().getFullYear().toString();
        const yearDir = path.join(customPath, year);
        
        // Create year directory in custom path if it doesn't exist
        fs.mkdirSync(yearDir, { recursive: true });
        
        const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
        savePath = path.join(yearDir, `${safeFileName}.pdf`);
      } else {
        // Use default path (Documents/Invoices/<year>/)
        const homeDir = os.homedir();
        const year = new Date().getFullYear().toString();
        const baseDir = path.join(homeDir, 'Documents', 'Invoices');
        const yearDir = path.join(baseDir, year);
        
        // Create the full directory structure if it doesn't exist
        fs.mkdirSync(baseDir, { recursive: true });
        fs.mkdirSync(yearDir, { recursive: true });
        
        const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
        savePath = path.join(yearDir, `${safeFileName}.pdf`);
      }

      // Write the PDF buffer to the file
      fs.writeFileSync(savePath, pdfBuffer);
      
      console.log('Invoice saved to:', savePath); // Debug log
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error; // Throw error to handle it in the renderer
    }
  });

  ipcMain.handle('export-data', async () => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Data',
        defaultPath: path.join(app.getPath('documents'), 'slyce-invoice-backup.json'),
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        const data = {
          customers: store.get('customers') || [],
          businessProfiles: store.get('businessProfiles') || [],
          quickTags: store.get('quickTags') || [],
          lastInvoiceNumber: store.get('lastInvoiceNumber'),
          defaultProfileId: store.get('defaultProfileId')
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  });

  ipcMain.handle('import-data', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Data',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths && filePaths[0]) {
        const fileContent = fs.readFileSync(filePaths[0], 'utf8');
        const data = JSON.parse(fileContent);
        
        // Validate the imported data structure
        const requiredKeys = ['customers', 'businessProfiles', 'quickTags'];
        if (!requiredKeys.every(key => Array.isArray(data[key]))) {
          throw new Error('Invalid data structure');
        }

        // Store the imported data
        for (const [key, value] of Object.entries(data)) {
          store.set(key, value);
        }

        return data;
      }
      return null;
    } catch (error) {
      console.error('Error importing data:', error);
      return null;
    }
  });

  ipcMain.handle('clearAllData', async () => {
    try {
      store.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  });

  ipcMain.handle('save-template', async (event, content, isDefault = false) => {
    try {
      const templateDir = getTemplateDirectory();
      
      // Update the default template
      const defaultTemplatePath = ensureTemplatesExist();
      await fs.promises.writeFile(defaultTemplatePath, content, 'utf8');
      
      // Only create a new template file if it's not the default template
      if (!isDefault) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const templateName = `template_${timestamp}.html`;
        const templatePath = path.join(templateDir, templateName);
        await fs.promises.writeFile(templatePath, content, 'utf8');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      return false;
    }
  });

  ipcMain.handle('deleteTemplate', async (event, templatePath) => {
    try {
      // Validate that the template is within the templates directory
      const templateDir = getTemplateDirectory();
      const normalizedTemplatePath = path.normalize(templatePath);
      const normalizedTemplateDir = path.normalize(templateDir);
      const defaultTemplatePath = ensureTemplatesExist();

      if (!normalizedTemplatePath.startsWith(normalizedTemplateDir)) {
        throw new Error('Invalid template path');
      }

      // Don't allow deletion of the default template
      if (normalizedTemplatePath === path.normalize(defaultTemplatePath)) {
        throw new Error('Cannot delete default template');
      }

      await fs.promises.unlink(templatePath);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  });

  ipcMain.handle('renameTemplate', async (event, templatePath, newName) => {
    try {
      const templateDir = getTemplateDirectory();
      const normalizedTemplatePath = path.normalize(templatePath);
      const normalizedTemplateDir = path.normalize(templateDir);
      const defaultTemplatePath = ensureTemplatesExist();

      if (!normalizedTemplatePath.startsWith(normalizedTemplateDir)) {
        throw new Error('Invalid template path');
      }

      if (normalizedTemplatePath === path.normalize(defaultTemplatePath)) {
        throw new Error('Cannot rename default template');
      }

      const newPath = path.join(templateDir, `template_${newName}.html`);
      await fs.promises.rename(templatePath, newPath);
      return newPath;
    } catch (error) {
      console.error('Error renaming template:', error);
      return false;
    }
  });

  ipcMain.handle('get-template', async () => {
    try {
      const templatePath = ensureTemplatesExist();
      const content = await fs.promises.readFile(templatePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error reading template:', error);
      throw error;
    }
  });

  ipcMain.handle('reset-template', async () => {
    try {
      const templateDir = getTemplateDirectory();
      const userTemplatePath = path.join(templateDir, 'invoice_template.html');
      const bundledTemplatesDir = path.join(__dirname, 'src', 'templates');
      const bundledTemplates = fs.readdirSync(bundledTemplatesDir);
      
      // Use the first template as default
      if (bundledTemplates.length > 0) {
        const defaultBundledPath = path.join(bundledTemplatesDir, bundledTemplates[0]);
        await fs.promises.copyFile(defaultBundledPath, userTemplatePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resetting template:', error);
      return false;
    }
  });

  async function generateTemplatePreview(htmlContent) {
    try {
      // Create a hidden window for preview generation
      const previewWindow = new BrowserWindow({
        width: 800,
        height: 1131, // A4 ratio
        show: false,
        webPreferences: {
          offscreen: true
        }
      });

      // Load the HTML content
      await previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      // Wait for any resources to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the preview
      const image = await previewWindow.webContents.capturePage();
      const preview = image.toDataURL();

      // Clean up
      previewWindow.destroy();

      return preview;
    } catch (error) {
      console.error('Error generating preview:', error);
      return null;
    }
  }

  ipcMain.handle('getRecentTemplates', async () => {
    try {
      const templateDir = getTemplateDirectory();
      const files = await fs.promises.readdir(templateDir);
      const defaultTemplatePath = ensureTemplatesExist();
      
      const templates = await Promise.all(
        files
          .filter(file => {
            // Exclude the default template and only show .html files
            const filePath = path.join(templateDir, file);
            return file.endsWith('.html') && 
                   path.normalize(filePath) !== path.normalize(defaultTemplatePath);
          })
          .map(async (file) => {
            const filePath = path.join(templateDir, file);
            const stats = await fs.promises.stat(filePath);
            
            // Generate preview
            let preview = null;
            try {
              const content = await fs.promises.readFile(filePath, 'utf8');
              preview = await generateTemplatePreview(content);
            } catch (err) {
              console.error('Error generating preview:', err);
            }
            
            return {
              name: file.replace(/^template_|\.\w+$/g, '').replace(/-/g, ' '),
              path: filePath,
              modified: stats.mtime.toLocaleDateString(),
              preview: preview
            };
          })
      );

      // Sort by most recently modified
      return templates.sort((a, b) => 
        new Date(b.modified) - new Date(a.modified)
      );
    } catch (error) {
      console.error('Error getting recent templates:', error);
      return [];
    }
  });

  ipcMain.handle('loadTemplateFromPath', async (event, templatePath) => {
    try {
      // Validate that the template is within the templates directory
      const templateDir = getTemplateDirectory();
      const normalizedTemplatePath = path.normalize(templatePath);
      const normalizedTemplateDir = path.normalize(templateDir);

      if (!normalizedTemplatePath.startsWith(normalizedTemplateDir)) {
        throw new Error('Invalid template path');
      }

      const content = await fs.promises.readFile(templatePath, 'utf8');
      
      // Also update the default template when loading a different one
      const defaultTemplatePath = ensureTemplatesExist();
      await fs.promises.writeFile(defaultTemplatePath, content, 'utf8');
      
      return content;
    } catch (error) {
      console.error('Error loading template from path:', error);
      return null;
    }
  });
}

app.whenReady().then(() => {
  // Register all IPC handlers first
  registerIpcHandlers();

  // Then create the window
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

