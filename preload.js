const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveInvoice: (pdfArrayBuffer, fileName) => ipcRenderer.invoke('save-invoice', pdfArrayBuffer, fileName),
  getData: (key) => ipcRenderer.invoke('getData', key),
  setData: (key, data) => ipcRenderer.invoke('setData', key, data),
  getInvoiceTemplate: () => ipcRenderer.invoke('getInvoiceTemplate'),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  selectDirectory: async () => {
    try {
      const result = await ipcRenderer.invoke('dialog:selectDirectory');
      return result || '';
    } catch (error) {
      console.error('Error in selectDirectory:', error);
      throw error;
    }
  },
  clearAllData: () => ipcRenderer.invoke('clearAllData'),
  getTemplatePath: () => ipcRenderer.invoke('getTemplatePath'),
  saveTemplate: (content, isDefault) => ipcRenderer.invoke('save-template', content, isDefault),
  resetTemplate: () => ipcRenderer.invoke('reset-template'),
  getTemplate: () => ipcRenderer.invoke('get-template'),
  getRecentTemplates: () => ipcRenderer.invoke('getRecentTemplates'),
  loadTemplateFromPath: (templatePath) => ipcRenderer.invoke('loadTemplateFromPath', templatePath),
  deleteTemplate: (templatePath) => ipcRenderer.invoke('deleteTemplate', templatePath),
  renameTemplate: (templatePath, newName) => ipcRenderer.invoke('renameTemplate', templatePath, newName),
  generatePDF: (data) => ipcRenderer.invoke('generatePDF', data),
});
