// File: main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Store = require('electron-store');
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

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

app.whenReady().then(() => {
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

  ipcMain.handle('getInvoiceTemplate', async () => {
    const templatePath = path.join(__dirname, 'src', 'invoice_template.html');
    return fs.readFileSync(templatePath, 'utf8');
  });

  ipcMain.handle('save-invoice', async (event, pdfArrayBuffer, fileName) => {
    try {
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      // Get the user's home directory
      const homeDir = os.homedir();

      // Construct the path to the Documents/Invoices/<year>/ directory
      const year = new Date().getFullYear();
      const invoicesDir = path.join(homeDir, 'Documents', 'Invoices', year.toString());

      // Create the directory if it doesn't exist
      fs.mkdirSync(invoicesDir, { recursive: true });

      // Construct the full file path
      const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-'); // Remove illegal filename characters
      const filePath = path.join(invoicesDir, `${safeFileName}.pdf`);

      // Write the PDF buffer to the file
      fs.writeFileSync(filePath, pdfBuffer);

      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return false;
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
