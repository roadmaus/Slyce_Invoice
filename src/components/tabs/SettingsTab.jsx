import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Save, Upload, Loader2, Info, FolderOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

const SettingsTab = () => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = React.useState('en');
  const [isLoading, setIsLoading] = React.useState({
    export: false,
    import: false
  });
  const [previewSettings, setPreviewSettings] = React.useState({
    showPreview: true,
    savePath: ''
  });

  // Load preview settings on mount
  React.useEffect(() => {
    const loadPreviewSettings = async () => {
      try {
        const settings = await window.electronAPI.getData('previewSettings');
        if (settings) {
          setPreviewSettings({
            showPreview: settings.showPreview ?? true,
            savePath: settings.savePath ?? ''
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      }
    };
    loadPreviewSettings();
  }, []);

  // Save preview settings when changed
  const updatePreviewSettings = async (newSettings) => {
    try {
      const sanitizedSettings = {
        showPreview: newSettings.showPreview ?? true,
        savePath: newSettings.savePath ?? ''
      };
      setPreviewSettings(sanitizedSettings);
      await window.electronAPI.setData('previewSettings', sanitizedSettings);
      window.dispatchEvent(new CustomEvent('previewSettingsChanged', { 
        detail: sanitizedSettings 
      }));
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleSelectDirectory = async () => {
    try {
      if (!window.electronAPI?.selectDirectory) {
        console.error('selectDirectory API not available');
        toast.error('Directory selection is not available');
        return;
      }

      const path = await window.electronAPI.selectDirectory();
      if (path) {
        await updatePreviewSettings({ 
          ...previewSettings, 
          savePath: path 
        });
        toast.success('Save location updated successfully');
      }
    } catch (error) {
      console.error('Directory selection error:', error);
      toast.error('Unable to select directory. Please try again.');
    }
  };

  // Load language settings on mount
  React.useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const settings = await window.electronAPI.getData('languageSettings');
        if (settings?.language) {
          setLanguage(settings.language);
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
        toast.error('Failed to load language settings');
      }
    };
    loadLanguageSettings();
  }, []);

  const updateLanguage = async (newLanguage) => {
    try {
      await window.electronAPI.setData('languageSettings', { language: newLanguage });
      setLanguage(newLanguage);
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLanguage } 
      }));
      toast.success('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-8">
            {/* Appearance Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Appearance</h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Customize how Slyce Invoice looks on your device. Choose between light, dark, or system theme.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', icon: Sun, label: 'Light', description: 'Light theme for bright environments' },
                  { value: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes in low light' },
                  { value: 'system', icon: Monitor, label: 'System', description: 'Follows your system preferences' }
                ].map(({ value, icon: Icon, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 
                      ${theme === value 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-muted hover:border-primary/50 hover:bg-accent'}`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-medium mb-1">{label}</h3>
                    <p className="text-xs text-center text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            {/* Language Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Language</h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Choose your preferred language for the application interface.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: 'en', label: 'English', flag: '🇺🇸' },
                  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
                  { value: 'es', label: 'Español', flag: '🇪🇸' },
                  { value: 'fr', label: 'Français', flag: '🇫🇷' }
                ].map(({ value, label, flag }) => (
                  <button
                    key={value}
                    onClick={() => updateLanguage(value)}
                    className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 
                      ${language === value 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-muted hover:border-primary/50 hover:bg-accent'}`}
                  >
                    <span className="text-2xl mb-2">{flag}</span>
                    <h3 className={`font-medium ${language === value ? 'text-primary' : ''}`}>
                      {label}
                    </h3>
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            {/* PDF Preview Settings Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">PDF Settings</h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Configure how PDFs are handled and where they are saved.
              </p>
              <div className="space-y-6">
                {/* Preview Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show PDF Preview</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically show preview dialog after generating invoices
                    </p>
                  </div>
                  <Switch
                    checked={previewSettings.showPreview}
                    onCheckedChange={(checked) => 
                      updatePreviewSettings({ ...previewSettings, showPreview: checked })
                    }
                  />
                </div>

                {/* Save Path Setting */}
                <div className="space-y-2">
                  <Label className="text-base">Default Save Location</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose the base folder where your invoices will be saved. Files will be organized as:<br/>
                    <code className="text-xs">[Selected Path]/Invoices/[YEAR]/[CUSTOMER]_[INVOICE_NUMBER].pdf</code>
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={previewSettings.savePath}
                      onChange={(e) => 
                        updatePreviewSettings({ ...previewSettings, savePath: e.target.value })
                      }
                      placeholder="Select a directory for saving invoices..."
                      className="flex-1"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={handleSelectDirectory}
                      className="flex-shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  {!previewSettings.savePath && (
                    <p className="text-sm text-muted-foreground mt-2">
                      If no path is set, invoices will be saved to the default downloads folder using the same structure
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Management Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Data Management</h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Backup and restore your data. Export your data to keep it safe or import previously exported data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Save,
                    title: "Export Data",
                    description: "Save all your business profiles, customers, and settings to a file.",
                    buttonText: "Export Data",
                    loading: isLoading.export,
                    onClick: async () => {
                      setIsLoading(prev => ({ ...prev, export: true }));
                      try {
                        const success = await window.electronAPI.exportData();
                        if (success) {
                          toast.success('Data exported successfully!');
                        } else {
                          toast.error('Failed to export data');
                        }
                      } catch (error) {
                        toast.error('Error exporting data');
                      } finally {
                        setIsLoading(prev => ({ ...prev, export: false }));
                      }
                    }
                  },
                  {
                    icon: Upload,
                    title: "Import Data",
                    description: "Restore your data from a previously exported file.",
                    buttonText: "Import Data",
                    loading: isLoading.import,
                    onClick: async () => {
                      setIsLoading(prev => ({ ...prev, import: true }));
                      try {
                        const importedData = await window.electronAPI.importData();
                        if (importedData) {
                          window.dispatchEvent(new CustomEvent('dataImported', { 
                            detail: importedData 
                          }));
                          toast.success('Data imported successfully!');
                        } else {
                          toast.error('Failed to import data');
                        }
                      } catch (error) {
                        toast.error('Error importing data');
                      } finally {
                        setIsLoading(prev => ({ ...prev, import: false }));
                      }
                    }
                  }
                ].map(({ icon: Icon, title, description, buttonText, loading, onClick }) => (
                  <Card 
                    key={title}
                    className="relative overflow-hidden border transition-all hover:shadow-md hover:border-primary/50"
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">{title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                      <div className="flex-grow" /> {/* This pushes the button to the bottom */}
                      <Button
                        variant="secondary"
                        onClick={onClick}
                        disabled={loading}
                        className="mt-6 w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {buttonText === 'Export Data' ? 'Exporting...' : 'Importing...'}
                          </>
                        ) : (
                          <>
                            <Icon className="w-4 h-4 mr-2" />
                            {buttonText}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;