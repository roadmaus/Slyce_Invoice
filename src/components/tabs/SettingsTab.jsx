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
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

const SettingsTab = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
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
        toast.error(t('settings.errors.loadSettings'));
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
      toast.success(t('settings.success.saveLocation'));
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(t('settings.errors.updateSettings'));
    }
  };

  const handleSelectDirectory = async () => {
    try {
      if (!window.electronAPI?.selectDirectory) {
        console.error('selectDirectory API not available');
        toast.error(t('settings.errors.directorySelection.notAvailable'));
        return;
      }

      const path = await window.electronAPI.selectDirectory();
      if (path) {
        await updatePreviewSettings({ 
          ...previewSettings, 
          savePath: path 
        });
        toast.success(t('settings.success.saveLocation'));
      }
    } catch (error) {
      console.error('Directory selection error:', error);
      toast.error(t('settings.errors.directorySelection.error'));
    }
  };

  // Load language settings on mount
  React.useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const settings = await window.electronAPI.getData('languageSettings');
        if (settings?.language) {
          setLanguage(settings.language);
          await i18n.changeLanguage(settings.language);
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
        toast.error(t('settings.errors.loadLanguage'));
      }
    };
    loadLanguageSettings();
  }, [i18n]);

  const updateLanguage = async (newLanguage) => {
    try {
      await window.electronAPI.setData('languageSettings', { language: newLanguage });
      setLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLanguage } 
      }));
      toast.success(t('settings.success.language'));
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error(t('settings.errors.updateLanguage'));
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
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('settings.appearance.title')}
                </h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                {t('settings.appearance.description')}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { 
                    value: 'light', 
                    icon: Sun, 
                    label: t('settings.appearance.themes.light.label'), 
                    description: t('settings.appearance.themes.light.description') 
                  },
                  { 
                    value: 'dark', 
                    icon: Moon, 
                    label: t('settings.appearance.themes.dark.label'), 
                    description: t('settings.appearance.themes.dark.description') 
                  },
                  { 
                    value: 'system', 
                    icon: Monitor, 
                    label: t('settings.appearance.themes.system.label'), 
                    description: t('settings.appearance.themes.system.description') 
                  }
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
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('settings.language.title')}
                </h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                {t('settings.language.description')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'en', label: 'English', flag: '🇺🇸' },
                  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
                  { value: 'es', label: 'Español', flag: '🇪🇸' },
                  { value: 'ko', label: '한국어', flag: '🇰🇷' }
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
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('settings.pdf.title')}
                </h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                {t('settings.pdf.description')}
              </p>
              <div className="space-y-6">
                {/* Preview Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {t('settings.pdf.preview.label')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.pdf.preview.description')}
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
                  <Label className="text-base">
                    {t('settings.pdf.save.label')}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('settings.pdf.save.description')}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={previewSettings.savePath}
                      onChange={(e) => 
                        updatePreviewSettings({ ...previewSettings, savePath: e.target.value })
                      }
                      placeholder={t('settings.pdf.save.placeholder')}
                      className="flex-1"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={handleSelectDirectory}
                      className="flex-shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {t('settings.pdf.save.browse')}
                    </Button>
                  </div>
                  {!previewSettings.savePath && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('settings.pdf.save.noPath')}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Management Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t('settings.dataManagement.title')}
                </h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                {t('settings.dataManagement.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Save,
                    title: t('settings.dataManagement.export.title'),
                    description: t('settings.dataManagement.export.description'),
                    buttonText: t('settings.dataManagement.export.button'),
                    loading: isLoading.export,
                    onClick: async () => {
                      setIsLoading(prev => ({ ...prev, export: true }));
                      try {
                        const success = await window.electronAPI.exportData();
                        if (success) {
                          toast.success(t('settings.dataManagement.export.success'));
                        } else {
                          toast.error(t('settings.dataManagement.export.error'));
                        }
                      } catch (error) {
                        toast.error(t('settings.dataManagement.export.genericError'));
                      } finally {
                        setIsLoading(prev => ({ ...prev, export: false }));
                      }
                    }
                  },
                  {
                    icon: Upload,
                    title: t('settings.dataManagement.import.title'),
                    description: t('settings.dataManagement.import.description'),
                    buttonText: t('settings.dataManagement.import.button'),
                    loading: isLoading.import,
                    onClick: async () => {
                      setIsLoading(prev => ({ ...prev, import: true }));
                      try {
                        const importedData = await window.electronAPI.importData();
                        if (importedData) {
                          window.dispatchEvent(new CustomEvent('dataImported', { 
                            detail: importedData 
                          }));
                          toast.success(t('settings.dataManagement.import.success'));
                        } else {
                          toast.error(t('settings.dataManagement.import.error'));
                        }
                      } catch (error) {
                        toast.error(t('settings.dataManagement.import.genericError'));
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
                            {buttonText === t('settings.dataManagement.export.button') 
                              ? t('settings.dataManagement.export.loading')
                              : t('settings.dataManagement.import.loading')}
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