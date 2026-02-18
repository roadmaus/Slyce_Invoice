import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Save, Upload, Loader2, FolderOpen, Trash2, FileEdit } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import TemplateEditor from '../TemplateEditor';
import { api } from '@/lib/api';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';

const SettingsTab = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState('en');
  const [isLoading, setIsLoading] = React.useState({ export: false, import: false });
  const [previewSettings, setPreviewSettings] = React.useState({ showPreview: true, savePath: '' });
  const [clickedLanguages, setClickedLanguages] = React.useState(new Set());
  const [showSwabian, setShowSwabian] = React.useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = React.useState(false);
  const [selectedCurrency, setSelectedCurrency] = React.useState(DEFAULT_CURRENCY);
  const [invoiceLanguage, setInvoiceLanguage] = React.useState('auto');

  // Load settings on mount
  React.useEffect(() => {
    const loadAll = async () => {
      try {
        const settings = await api.getData('previewSettings');
        if (settings) setPreviewSettings({ showPreview: settings.showPreview ?? true, savePath: settings.savePath ?? '' });
        const langSettings = await api.getData('languageSettings');
        if (langSettings?.language) { setLanguage(langSettings.language); await i18n.changeLanguage(langSettings.language); }
        const swabian = await api.getData('swabianUnlocked');
        setShowSwabian(!!swabian?.unlocked);
        const savedCurrency = await api.getData('currency');
        if (savedCurrency) setSelectedCurrency(savedCurrency);
        const invLangSettings = await api.getData('invoiceLanguageSettings');
        if (invLangSettings?.invoiceLanguage) setInvoiceLanguage(invLangSettings.invoiceLanguage);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadAll();
  }, [i18n]);

  const updatePreviewSettings = async (newSettings) => {
    try {
      const sanitizedSettings = { showPreview: newSettings.showPreview ?? true, savePath: newSettings.savePath ?? '' };
      setPreviewSettings(sanitizedSettings);
      await api.setData('previewSettings', sanitizedSettings);
      window.dispatchEvent(new CustomEvent('previewSettingsChanged', { detail: sanitizedSettings }));
      if (newSettings.savePath !== previewSettings.savePath) toast.success(t('settings.success.saveLocation'));
      else if (newSettings.showPreview !== previewSettings.showPreview) toast.success(t('settings.success.previewToggle'));
    } catch (error) {
      toast.error(t('settings.errors.updateSettings'));
    }
  };

  const handleSelectDirectory = async () => {
    try {
      const path = await api.selectDirectory();
      if (path) { await updatePreviewSettings({ ...previewSettings, savePath: path }); toast.success(t('settings.success.saveLocation')); }
    } catch (error) {
      toast.error(t('settings.errors.directorySelection.error'));
    }
  };

  const updateLanguage = async (newLanguage) => {
    try {
      await api.setData('languageSettings', { language: newLanguage });
      setLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLanguage } }));
      toast.success(t('settings.success.language'));
    } catch (error) {
      toast.error(t('settings.errors.updateLanguage'));
    }
  };

  const handleLanguageClick = async (value) => {
    await updateLanguage(value);
    if (showSwabian) return;
    const newClickedLanguages = new Set(clickedLanguages).add(value);
    setClickedLanguages(newClickedLanguages);
    const standardLanguages = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th'];
    if (standardLanguages.every(lang => newClickedLanguages.has(lang))) {
      setShowSwabian(true);
      await api.setData('swabianUnlocked', { unlocked: true });
      toast.success('🦁 Schwäbisch freigschalded!', { duration: 2000 });
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      await api.setData('currency', newCurrency);
      setSelectedCurrency(newCurrency);
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
      toast.success(t('settings.success.currency'));
    } catch (error) {
      toast.error(t('settings.errors.updateCurrency'));
    }
  };

  const handleInvoiceLanguageChange = async (newLanguage) => {
    try {
      await api.setData('invoiceLanguageSettings', { invoiceLanguage: newLanguage });
      setInvoiceLanguage(newLanguage);
      window.dispatchEvent(new CustomEvent('invoiceLanguageChanged', { detail: { invoiceLanguage: newLanguage } }));
      toast.success(t('settings.success.invoiceLanguage'));
    } catch (error) {
      toast.error(t('settings.errors.updateInvoiceLanguage'));
    }
  };

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'th', label: 'ไทย', flag: '🇹🇭' },
    ...(showSwabian ? [{ value: 'swg', label: 'Schwäbisch', flag: '🦁' }] : [])
  ];

  return (
    <div className="b-page">
      {/* Language */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.language.title')}</div>
        <div className="b-section-desc">{t('settings.language.description')}</div>
        <div className="b-option-grid">
          {languages.map(({ value, label, flag }) => (
            <button
              key={value}
              onClick={() => handleLanguageClick(value)}
              className="b-option-btn"
              data-active={language === value}
            >
              <span className="b-option-icon">{flag}</span>
              <span className="b-option-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.currency.title')}</div>
        <div className="b-section-desc">{t('settings.currency.description')}</div>
        <div className="b-option-grid">
          {SUPPORTED_CURRENCIES.map(({ code, symbol, name }) => (
            <button
              key={code}
              onClick={() => updateCurrency({ code, symbol, name })}
              className="b-option-btn"
              data-active={selectedCurrency.code === code}
            >
              <span className="b-option-icon">{symbol}</span>
              <span className="b-option-label">{name}</span>
              <span className="b-option-sub">{code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.appearance.title')}</div>
        <div className="b-section-desc">{t('settings.appearance.description')}</div>
        <div className="b-option-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { value: 'light', icon: Sun, label: t('settings.appearance.themes.light.label') },
            { value: 'dark', icon: Moon, label: t('settings.appearance.themes.dark.label') },
            { value: 'system', icon: Monitor, label: t('settings.appearance.themes.system.label') },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="b-option-btn"
              data-active={theme === value}
            >
              <Icon style={{ width: 24, height: 24, marginBottom: 6 }} />
              <span className="b-option-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Settings */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.pdf.title')}</div>
        <div className="b-section-desc">{t('settings.pdf.description')}</div>
        <div className="b-toggle-row">
          <div>
            <div className="b-toggle-label">{t('settings.pdf.preview.label')}</div>
            <div className="b-toggle-desc">{t('settings.pdf.preview.description')}</div>
          </div>
          <Switch
            checked={previewSettings.showPreview}
            onCheckedChange={(checked) => updatePreviewSettings({ ...previewSettings, showPreview: checked })}
          />
        </div>
        <div style={{ marginTop: '16px' }}>
          <div className="b-toggle-label">{t('settings.pdf.save.label')}</div>
          <div className="b-toggle-desc" style={{ marginBottom: '8px' }}>{t('settings.pdf.save.description')}</div>
          <div className="b-path-row">
            <input
              className="b-path-input"
              value={previewSettings.savePath}
              readOnly
              placeholder={t('settings.pdf.save.placeholder')}
            />
            <button className="b-btn" onClick={handleSelectDirectory}>
              <FolderOpen style={{ width: 14, height: 14 }} />
              {t('settings.pdf.save.browse')}
            </button>
          </div>
          {!previewSettings.savePath && (
            <div className="b-toggle-desc" style={{ marginTop: '8px' }}>{t('settings.pdf.save.noPath')}</div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.dataManagement.title')}</div>
        <div className="b-section-desc">{t('settings.dataManagement.description')}</div>
        <div className="b-data-grid">
          {[
            {
              icon: Save, title: t('settings.dataManagement.export.title'),
              description: t('settings.dataManagement.export.description'),
              buttonText: t('settings.dataManagement.export.button'),
              loading: isLoading.export,
              onClick: async () => {
                setIsLoading(prev => ({ ...prev, export: true }));
                try {
                  const success = await api.exportData();
                  toast[success ? 'success' : 'error'](t(`settings.dataManagement.export.${success ? 'success' : 'error'}`));
                } catch { toast.error(t('settings.dataManagement.export.genericError')); }
                finally { setIsLoading(prev => ({ ...prev, export: false })); }
              }
            },
            {
              icon: Upload, title: t('settings.dataManagement.import.title'),
              description: t('settings.dataManagement.import.description'),
              buttonText: t('settings.dataManagement.import.button'),
              loading: isLoading.import,
              onClick: async () => {
                setIsLoading(prev => ({ ...prev, import: true }));
                try {
                  const importedData = await api.importData();
                  if (importedData) {
                    window.dispatchEvent(new CustomEvent('dataImported', { detail: importedData }));
                    toast.success(t('settings.dataManagement.import.success'));
                  } else { toast.error(t('settings.dataManagement.import.error')); }
                } catch { toast.error(t('settings.dataManagement.import.genericError')); }
                finally { setIsLoading(prev => ({ ...prev, import: false })); }
              }
            },
            {
              icon: FileEdit, title: t('settings.invoice.template'),
              description: t('settings.invoice.templateDescription'),
              buttonText: t('settings.actions.editTemplate'),
              onClick: () => setShowTemplateEditor(true)
            },
            {
              icon: Trash2, title: t('settings.dataManagement.reset.title'),
              description: t('settings.dataManagement.reset.description'),
              buttonText: t('settings.dataManagement.reset.button'),
              destructive: true,
              onClick: async () => {
                if (!window.confirm(t('settings.dataManagement.reset.confirm'))) return;
                try {
                  await api.clearAllData();
                  setLanguage('en'); setShowSwabian(false); setClickedLanguages(new Set());
                  setPreviewSettings({ showPreview: true, savePath: '' });
                  setTheme('system'); await i18n.changeLanguage('en');
                  window.dispatchEvent(new CustomEvent('settingsReset'));
                  toast.success(t('settings.dataManagement.reset.success'));
                  setTimeout(() => window.location.reload(), 1500);
                } catch { toast.error(t('settings.dataManagement.reset.error')); }
              }
            }
          ].map(({ icon: Icon, title, description, buttonText, loading, onClick, destructive }) => (
            <div key={title} className="b-data-card">
              <div className="b-data-card-title">
                <Icon style={{ width: 16, height: 16, color: destructive ? 'hsl(var(--destructive))' : undefined }} />
                <span style={{ color: destructive ? 'hsl(var(--destructive))' : undefined }}>{title}</span>
              </div>
              <div className="b-data-card-desc">{description}</div>
              <button
                className={destructive ? 'b-btn b-btn-destructive' : 'b-btn'}
                onClick={onClick}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Icon style={{ width: 14, height: 14 }} />}
                {buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Language */}
      <div className="b-settings-section">
        <div className="b-section-title">{t('settings.language.invoiceLanguage')}</div>
        <div className="b-section-desc">{t('settings.language.invoiceLanguageDescription')}</div>
        <RadioGroup
          value={invoiceLanguage}
          onValueChange={handleInvoiceLanguageChange}
          className="b-option-grid"
        >
          {[
            { value: 'auto', label: t('settings.language.invoiceLanguages.auto'), flag: '🌐' },
            ...languages
          ].map(({ value, label, flag }) => (
            <div key={value}>
              <RadioGroupItem value={value} id={`invoice-lang-${value}`} className="peer sr-only" />
              <Label
                htmlFor={`invoice-lang-${value}`}
                className="b-option-btn"
                data-active={invoiceLanguage === value}
                style={{ cursor: 'pointer' }}
              >
                <span className="b-option-icon">{flag}</span>
                <span className="b-option-label">{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {showTemplateEditor && <TemplateEditor onClose={() => setShowTemplateEditor(false)} />}
    </div>
  );
};

export default SettingsTab;
