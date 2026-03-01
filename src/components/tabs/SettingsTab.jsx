import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Save, Upload, Loader2, FolderOpen, Trash2, FileEdit, Globe, Coins, Palette, FileText, Database, ChevronRight, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import TemplateEditor from '../TemplateEditor';
import { api } from '@/lib/api';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';

const SECTIONS = [
  { id: 'language', icon: Globe },
  { id: 'currency', icon: Coins },
  { id: 'appearance', icon: Palette },
  { id: 'pdf', icon: FileText },
  { id: 'data', icon: Database },
];

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
  const [activeSection, setActiveSection] = React.useState('language');
  const [eRechnungEnabled, setERechnungEnabled] = React.useState(false);

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
        const savedERechnung = await api.getData('eRechnungEnabled');
        if (savedERechnung !== null && savedERechnung !== undefined) setERechnungEnabled(savedERechnung);
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

  const sectionLabels = {
    language: t('settings.language.title'),
    currency: t('settings.currency.title'),
    appearance: t('settings.appearance.title'),
    pdf: t('settings.pdf.title'),
    data: t('settings.dataManagement.title'),
  };

  const sectionSummaries = {
    language: languages.find(l => l.value === language)?.label || 'English',
    currency: `${selectedCurrency.symbol} ${selectedCurrency.code}`,
    appearance: theme === 'light' ? t('settings.appearance.themes.light.label') : theme === 'dark' ? t('settings.appearance.themes.dark.label') : t('settings.appearance.themes.system.label'),
    pdf: previewSettings.showPreview ? 'Preview ON' : 'Preview OFF',
    data: '',
  };

  return (
    <div className="b-page">
      <div className="stg-layout">
        {/* Sidebar Navigation */}
        <nav className="stg-nav">
          {SECTIONS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className="stg-nav-item"
              data-active={activeSection === id}
              onClick={() => setActiveSection(id)}
            >
              <Icon className="stg-nav-icon" />
              <div className="stg-nav-text">
                <span className="stg-nav-label">{sectionLabels[id]}</span>
                {sectionSummaries[id] && (
                  <span className="stg-nav-summary">{sectionSummaries[id]}</span>
                )}
              </div>
              <ChevronRight className="stg-nav-arrow" />
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div className="stg-content">
          {/* Language Section */}
          {activeSection === 'language' && (
            <div className="stg-panel">
              <div className="stg-panel-header">
                <h2 className="stg-panel-title">{t('settings.language.title')}</h2>
                <p className="stg-panel-desc">{t('settings.language.description')}</p>
              </div>

              <div className="stg-subsection">
                <div className="stg-subsection-label">{t('settings.language.title')}</div>
                <div className="stg-lang-list">
                  {languages.map(({ value, label, flag }) => (
                    <button
                      key={value}
                      onClick={() => handleLanguageClick(value)}
                      className="stg-lang-item"
                      data-active={language === value}
                    >
                      <span className="stg-lang-flag">{flag}</span>
                      <span className="stg-lang-name">{label}</span>
                      {language === value && <Check className="stg-lang-check" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stg-divider" />

              <div className="stg-subsection">
                <div className="stg-subsection-label">{t('settings.language.invoiceLanguage')}</div>
                <p className="stg-subsection-desc">{t('settings.language.invoiceLanguageDescription')}</p>
                <RadioGroup
                  value={invoiceLanguage}
                  onValueChange={handleInvoiceLanguageChange}
                  className="stg-lang-list"
                >
                  {[
                    { value: 'auto', label: t('settings.language.invoiceLanguages.auto'), flag: '🌐' },
                    ...languages
                  ].map(({ value, label, flag }) => (
                    <div key={value}>
                      <RadioGroupItem value={value} id={`invoice-lang-${value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`invoice-lang-${value}`}
                        className="stg-lang-item"
                        data-active={invoiceLanguage === value}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="stg-lang-flag">{flag}</span>
                        <span className="stg-lang-name">{label}</span>
                        {invoiceLanguage === value && <Check className="stg-lang-check" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Currency Section */}
          {activeSection === 'currency' && (
            <div className="stg-panel">
              <div className="stg-panel-header">
                <h2 className="stg-panel-title">{t('settings.currency.title')}</h2>
                <p className="stg-panel-desc">{t('settings.currency.description')}</p>
              </div>
              <div className="stg-lang-list">
                {SUPPORTED_CURRENCIES.map(({ code, symbol, name }) => (
                  <button
                    key={code}
                    onClick={() => updateCurrency({ code, symbol, name })}
                    className="stg-lang-item"
                    data-active={selectedCurrency.code === code}
                  >
                    <span className="stg-currency-symbol">{symbol}</span>
                    <span className="stg-lang-name">{name}</span>
                    <span className="stg-currency-code">{code}</span>
                    {selectedCurrency.code === code && <Check className="stg-lang-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="stg-panel">
              <div className="stg-panel-header">
                <h2 className="stg-panel-title">{t('settings.appearance.title')}</h2>
                <p className="stg-panel-desc">{t('settings.appearance.description')}</p>
              </div>
              <div className="stg-theme-grid">
                {[
                  { value: 'light', icon: Sun, label: t('settings.appearance.themes.light.label') },
                  { value: 'dark', icon: Moon, label: t('settings.appearance.themes.dark.label') },
                  { value: 'system', icon: Monitor, label: t('settings.appearance.themes.system.label') },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className="stg-theme-card"
                    data-active={theme === value}
                  >
                    <Icon className="stg-theme-icon" />
                    <span className="stg-theme-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF Section */}
          {activeSection === 'pdf' && (
            <div className="stg-panel">
              <div className="stg-panel-header">
                <h2 className="stg-panel-title">{t('settings.pdf.title')}</h2>
                <p className="stg-panel-desc">{t('settings.pdf.description')}</p>
              </div>

              <div className="stg-row">
                <div className="stg-row-text">
                  <div className="stg-row-label">{t('settings.pdf.preview.label')}</div>
                  <div className="stg-row-desc">{t('settings.pdf.preview.description')}</div>
                </div>
                <Switch
                  checked={previewSettings.showPreview}
                  onCheckedChange={(checked) => updatePreviewSettings({ ...previewSettings, showPreview: checked })}
                />
              </div>

              <div className="stg-divider" />

              <div className="stg-subsection">
                <div className="stg-row-label">{t('settings.pdf.save.label')}</div>
                <div className="stg-row-desc" style={{ marginBottom: 12 }}>{t('settings.pdf.save.description')}</div>
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
                  <div className="stg-row-desc" style={{ marginTop: 8 }}>{t('settings.pdf.save.noPath')}</div>
                )}
              </div>

              <div className="stg-divider" />

              <div className="stg-row">
                <div className="stg-row-text">
                  <div className="stg-row-label">{t('settings.pdf.eRechnung.label')}</div>
                  <div className="stg-row-desc">{t('settings.pdf.eRechnung.description')}</div>
                </div>
                <Switch
                  checked={eRechnungEnabled}
                  onCheckedChange={async (checked) => {
                    setERechnungEnabled(checked);
                    await api.setData('eRechnungEnabled', checked);
                    window.dispatchEvent(new CustomEvent('eRechnungChanged', { detail: checked }));
                    toast.success(t('settings.pdf.eRechnung.toggle'));
                  }}
                />
              </div>

              <div className="stg-divider" />

              <div className="stg-subsection">
                <div className="stg-row-label">{t('settings.invoice.template')}</div>
                <div className="stg-row-desc" style={{ marginBottom: 12 }}>{t('settings.invoice.templateDescription')}</div>
                <button className="b-btn" onClick={() => setShowTemplateEditor(true)}>
                  <FileEdit style={{ width: 14, height: 14 }} />
                  {t('settings.actions.editTemplate')}
                </button>
              </div>
            </div>
          )}

          {/* Data Section */}
          {activeSection === 'data' && (
            <div className="stg-panel">
              <div className="stg-panel-header">
                <h2 className="stg-panel-title">{t('settings.dataManagement.title')}</h2>
                <p className="stg-panel-desc">{t('settings.dataManagement.description')}</p>
              </div>

              <div className="stg-action-list">
                <div className="stg-action-item">
                  <div className="stg-action-info">
                    <Save className="stg-action-icon" />
                    <div>
                      <div className="stg-row-label">{t('settings.dataManagement.export.title')}</div>
                      <div className="stg-row-desc">{t('settings.dataManagement.export.description')}</div>
                    </div>
                  </div>
                  <button
                    className="b-btn"
                    disabled={isLoading.export}
                    onClick={async () => {
                      setIsLoading(prev => ({ ...prev, export: true }));
                      try {
                        const success = await api.exportData();
                        toast[success ? 'success' : 'error'](t(`settings.dataManagement.export.${success ? 'success' : 'error'}`));
                      } catch { toast.error(t('settings.dataManagement.export.genericError')); }
                      finally { setIsLoading(prev => ({ ...prev, export: false })); }
                    }}
                  >
                    {isLoading.export ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 14, height: 14 }} />}
                    {t('settings.dataManagement.export.button')}
                  </button>
                </div>

                <div className="stg-action-item">
                  <div className="stg-action-info">
                    <Upload className="stg-action-icon" />
                    <div>
                      <div className="stg-row-label">{t('settings.dataManagement.import.title')}</div>
                      <div className="stg-row-desc">{t('settings.dataManagement.import.description')}</div>
                    </div>
                  </div>
                  <button
                    className="b-btn"
                    disabled={isLoading.import}
                    onClick={async () => {
                      setIsLoading(prev => ({ ...prev, import: true }));
                      try {
                        const importedData = await api.importData();
                        if (importedData) {
                          window.dispatchEvent(new CustomEvent('dataImported', { detail: importedData }));
                          toast.success(t('settings.dataManagement.import.success'));
                        } else { toast.error(t('settings.dataManagement.import.error')); }
                      } catch { toast.error(t('settings.dataManagement.import.genericError')); }
                      finally { setIsLoading(prev => ({ ...prev, import: false })); }
                    }}
                  >
                    {isLoading.import ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Upload style={{ width: 14, height: 14 }} />}
                    {t('settings.dataManagement.import.button')}
                  </button>
                </div>

                <div className="stg-divider" />

                <div className="stg-action-item stg-action-destructive">
                  <div className="stg-action-info">
                    <Trash2 className="stg-action-icon" style={{ color: 'hsl(var(--destructive))' }} />
                    <div>
                      <div className="stg-row-label" style={{ color: 'hsl(var(--destructive))' }}>{t('settings.dataManagement.reset.title')}</div>
                      <div className="stg-row-desc">{t('settings.dataManagement.reset.description')}</div>
                    </div>
                  </div>
                  <button
                    className="b-btn b-btn-destructive"
                    onClick={async () => {
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
                    }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    {t('settings.dataManagement.reset.button')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTemplateEditor && <TemplateEditor onClose={() => setShowTemplateEditor(false)} />}
    </div>
  );
};

export default SettingsTab;
