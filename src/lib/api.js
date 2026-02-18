import { Store } from '@tauri-apps/plugin-store';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { revealItemInDir } from '@tauri-apps/plugin-opener';

let storeInstance = null;

async function getStore() {
  if (!storeInstance) {
    storeInstance = await Store.load('store.json');
  }
  return storeInstance;
}

export const api = {
  // Store operations
  getData: async (key) => {
    const store = await getStore();
    return store.get(key);
  },
  setData: async (key, data) => {
    const store = await getStore();
    await store.set(key, data);
    await store.save();
    return true;
  },
  clearAllData: async () => {
    const store = await getStore();
    await store.clear();
    await store.save();
    return true;
  },

  // Dialogs
  selectDirectory: async () => {
    const selected = await open({ directory: true, title: 'Select Invoice Save Location' });
    return selected || '';
  },
  showItemInFolder: (path) => revealItemInDir(path),

  // Rust commands
  saveInvoice: async (pdfArrayBuffer, fileName, customSavePath) => {
    const pdfData = Array.from(new Uint8Array(pdfArrayBuffer));
    return invoke('save_invoice', { pdfData, fileName, customSavePath: customSavePath || null });
  },
  getInvoiceTemplate: () => invoke('get_invoice_template'),
  getTemplate: () => invoke('get_invoice_template'),
  getTemplatePath: () => invoke('get_template_path'),
  saveTemplate: (content, isDefault) => invoke('save_template', { content, isDefault }),
  resetTemplate: () => invoke('reset_template'),
  getRecentTemplates: () => invoke('get_recent_templates'),
  loadTemplateFromPath: (path) => invoke('load_template_from_path', { path }),
  deleteTemplate: (path) => invoke('delete_template', { path }),
  renameTemplate: (path, newName) => invoke('rename_template', { path, newName }),
  exportData: async () => {
    // Gather data from store and pass to Rust for save dialog
    const store = await getStore();
    const data = {
      customers: await store.get('customers') || [],
      businessProfiles: await store.get('businessProfiles') || [],
      quickTags: await store.get('quickTags') || [],
      lastInvoiceNumber: await store.get('lastInvoiceNumber'),
      defaultProfileId: await store.get('defaultProfileId'),
    };
    return invoke('export_data', { data: JSON.stringify(data, null, 2) });
  },
  importData: async () => {
    const result = await invoke('import_data');
    if (result) {
      const data = JSON.parse(result);
      // Store imported data
      const store = await getStore();
      for (const [key, value] of Object.entries(data)) {
        await store.set(key, value);
      }
      await store.save();
      return data;
    }
    return null;
  },
};
