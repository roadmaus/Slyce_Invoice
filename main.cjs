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
          'img-src': ["'self'", 'data:'],
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

  const ensureTemplateExists = () => {
    const templateDir = getTemplateDirectory();
    const userTemplatePath = path.join(templateDir, 'invoice_template.html');
    
    // Create template directory if it doesn't exist
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }
    
    // Copy bundled template if user template doesn't exist
    if (!fs.existsSync(userTemplatePath)) {
      const bundledTemplatePath = path.join(__dirname, 'src', 'invoice_template.html');
      fs.copyFileSync(bundledTemplatePath, userTemplatePath);
    }
    
    return userTemplatePath;
  };

  ipcMain.handle('getInvoiceTemplate', async () => {
    const templatePath = ensureTemplateExists();
    return fs.readFileSync(templatePath, 'utf8');
  });

  ipcMain.handle('getTemplatePath', () => {
    return ensureTemplateExists();
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

  ipcMain.handle('save-template', async (event, content) => {
    try {
      const templatePath = ensureTemplateExists();
      await fs.promises.writeFile(templatePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      return false;
    }
  });

  ipcMain.handle('get-template', async () => {
    try {
      const templatePath = ensureTemplateExists();
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
      const bundledTemplatePath = path.join(__dirname, 'src', 'invoice_template.html');
      
      await fs.promises.copyFile(bundledTemplatePath, userTemplatePath);
      return true;
    } catch (error) {
      console.error('Error resetting template:', error);
      return false;
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

