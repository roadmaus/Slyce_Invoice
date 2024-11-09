const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveInvoice: (pdfArrayBuffer, fileName) => ipcRenderer.invoke('save-invoice', pdfArrayBuffer, fileName),
  getData: (key) => ipcRenderer.invoke('getData', key),
  setData: (key, data) => ipcRenderer.invoke('setData', key, data),
  getInvoiceTemplate: () => ipcRenderer.invoke('getInvoiceTemplate'),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data')
});
