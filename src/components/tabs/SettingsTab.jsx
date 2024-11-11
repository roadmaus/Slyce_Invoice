import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Save, Upload, Loader2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const SettingsTab = () => {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = React.useState({
    export: false,
    import: false
  });
  const [previewSettings, setPreviewSettings] = React.useState({
    showPreview: true
  });

  // Load preview settings on mount
  React.useEffect(() => {
    const loadPreviewSettings = async () => {
      const settings = await window.electronAPI.getData('previewSettings');
      if (settings) {
        setPreviewSettings(settings);
      }
    };
    loadPreviewSettings();
  }, []);

  // Save preview settings when changed
  const updatePreviewSettings = async (newSettings) => {
    setPreviewSettings(newSettings);
    await window.electronAPI.setData('previewSettings', newSettings);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('previewSettingsChanged', { 
      detail: newSettings 
    }));
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

            {/* PDF Preview Settings Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">PDF Preview</h2>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Configure how PDF previews are handled after generating invoices.
              </p>
              <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Export Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save all your business profiles, customers, and settings to a file.
                  </p>
                  <Button
                    variant="outline"
                    onClick={async () => {
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
                    }}
                    className="w-full"
                    disabled={isLoading.export}
                  >
                    {isLoading.export ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Restore your data from a previously exported file.
                  </p>
                  <Button
                    variant="outline"
                    onClick={async () => {
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
                    }}
                    className="w-full"
                    disabled={isLoading.import}
                  >
                    {isLoading.import ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;