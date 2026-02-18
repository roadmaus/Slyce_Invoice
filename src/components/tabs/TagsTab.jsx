import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { api } from '@/lib/api';

const TagsTab = ({
  quickTags,
  setQuickTags,
  newTag,
  setNewTag,
  showNewTagDialog,
  setShowNewTagDialog,
  businessProfiles,
  handleTagDialog,
  addQuickTag,
  isDarkMode,
  getTagBackground,
  PREDEFINED_COLORS
}) => {
  const { t } = useTranslation();
  const [selectedCurrency, setSelectedCurrency] = React.useState(DEFAULT_CURRENCY);

  React.useEffect(() => {
    const loadCurrency = async () => {
      const savedCurrency = await api.getData('currency');
      if (savedCurrency) setSelectedCurrency(savedCurrency);
    };
    loadCurrency();
  }, []);

  React.useEffect(() => {
    const handleCurrencyChange = (event) => setSelectedCurrency(event.detail);
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const emptyTag = {
    name: '', description: '', rate: '', quantity: '',
    color: PREDEFINED_COLORS[0].value, hasDateRange: true, visible: true, personas: [],
  };

  return (
    <div className="b-page">
      {/* Header */}
      <div className="b-page-header">
        <span className="b-page-title">{t('tags.title')}</span>
        <button className="b-btn" onClick={() => { setNewTag(emptyTag); setShowNewTagDialog(true); }}>
          + {t('tags.actions.add')}
        </button>
      </div>

      {/* Dialog */}
      <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>
              {newTag.name ? t('tags.dialog.editTitle') : t('tags.dialog.addTitle')}
            </DialogTitle>
            <DialogDescription className="b-mono" style={{ fontSize: '0.75rem' }}>
              {newTag.name ? t('tags.dialog.editDescription') : t('tags.dialog.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="form-field">
              <Label className="b-label">{t('tags.form.name')}</Label>
              <Input
                className="brutalist-input"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <Label className="b-label">{t('tags.form.description')}</Label>
              <Input
                className="brutalist-input"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <Label className="b-label">{t('tags.form.rate')}</Label>
                <Input
                  className="brutalist-input"
                  type="number"
                  value={newTag.rate}
                  onChange={(e) => setNewTag({ ...newTag, rate: e.target.value })}
                  min="0" step="0.01"
                />
              </div>
              <div className="form-field">
                <Label className="b-label">{t('tags.form.quantity')}</Label>
                <Input
                  className="brutalist-input"
                  type="number"
                  value={newTag.quantity}
                  onChange={(e) => setNewTag({ ...newTag, quantity: e.target.value })}
                  min="0" step="0.5"
                />
              </div>
            </div>

            <div className="form-field">
              <Label className="b-label">{t('tags.form.color')}</Label>
              <div className="color-picker-grid">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewTag({ ...newTag, color: color.value })}
                    className="color-picker-item"
                    data-selected={newTag.color === color.value}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="switch-container">
              <Switch
                checked={newTag.visible}
                onCheckedChange={(checked) => setNewTag({ ...newTag, visible: checked })}
              />
              <Label className="b-label" style={{ marginBottom: 0 }}>{t('tags.form.visible')}</Label>
            </div>

            <div className="switch-container">
              <Switch
                checked={newTag.hasDateRange}
                onCheckedChange={(checked) => setNewTag({ ...newTag, hasDateRange: checked })}
              />
              <Label className="b-label" style={{ marginBottom: 0 }}>{t('tags.form.usesDateRange')}</Label>
            </div>

            <div className="form-field">
              <Label className="b-label">{t('tags.form.personas')}</Label>
              <ReactSelect
                isMulti
                options={businessProfiles.map((profile) => ({
                  value: profile.company_name, label: profile.company_name,
                }))}
                value={newTag.personas.map((persona) => ({
                  value: persona, label: persona,
                }))}
                onChange={(selectedOptions) => {
                  setNewTag({
                    ...newTag,
                    personas: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                  });
                }}
                classNamePrefix="select"
                className="select-container"
                unstyled
                styles={{ input: (base) => ({ ...base, color: 'inherit' }) }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="b-btn b-btn-outline" onClick={() => { setNewTag(emptyTag); setShowNewTagDialog(false); }}>
                {t('common.cancel')}
              </button>
              <button className="b-btn" onClick={() => {
                if (newTag.name && quickTags.find(t => t.name === newTag.name)) {
                  setQuickTags(quickTags.map(t => t.name === newTag.name ? newTag : t));
                } else {
                  addQuickTag();
                }
                setNewTag(emptyTag);
                setShowNewTagDialog(false);
              }}>
                {newTag.name ? t('common.save') : t('tags.actions.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      {quickTags.length === 0 ? (
        <div className="b-empty">
          <Tags className="h-10 w-10 mx-auto b-empty-icon" />
          <div className="b-empty-title">{t('tags.emptyState.title')}</div>
          <div className="b-empty-desc">{t('tags.emptyState.description')}</div>
          <button className="b-btn" onClick={() => setShowNewTagDialog(true)}>
            + {t('tags.emptyState.addFirst')}
          </button>
        </div>
      ) : (
        <div className="b-card-grid">
          {quickTags.map((tag, index) => (
            <div key={index} className="b-tag-card">
              {/* Color bar */}
              <div className="b-tag-color-bar" style={{ backgroundColor: tag.color || '#e2e8f0' }} />

              {/* Actions */}
              <div className="b-card-actions">
                <button className="b-icon-btn" onClick={() => handleTagDialog(tag)}>
                  <Edit />
                </button>
                <button className="b-icon-btn b-icon-btn-destructive" onClick={() => {
                  setQuickTags(quickTags.filter((_, i) => i !== index));
                }}>
                  <Trash2 />
                </button>
              </div>

              {/* Visibility toggle */}
              <div className="mb-3">
                <Switch
                  checked={tag.visible}
                  onCheckedChange={(checked) => {
                    const updatedTags = [...quickTags];
                    updatedTags[index].visible = checked;
                    setQuickTags(updatedTags);
                  }}
                />
              </div>

              {/* Tag name */}
              <div className="b-card-name" style={{ paddingLeft: '12px' }}>{tag.name}</div>

              {/* Description */}
              <div className="b-card-detail line-clamp-2" style={{ paddingLeft: '12px', marginBottom: '12px' }}>
                {tag.description || t('tags.form.noDescription')}
              </div>

              {/* Rate & Quantity */}
              <div style={{ paddingLeft: '12px' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="b-tag-meta">{t('tags.form.rate')}</span>
                  <span className="b-tag-rate">{selectedCurrency.symbol}{parseFloat(tag.rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="b-tag-meta">{t('tags.form.quantity')}</span>
                  <span className="b-mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tag.quantity}</span>
                </div>
                {tag.hasDateRange && (
                  <div className="b-card-badge" style={{ marginTop: '8px' }}>{t('tags.form.usesDateRange')}</div>
                )}
              </div>

              {/* Personas */}
              {tag.personas?.length > 0 && (
                <div style={{ paddingLeft: '12px', marginTop: '12px' }}>
                  <div className="b-label" style={{ marginBottom: '4px' }}>{t('tags.form.personas')}</div>
                  <div className="flex flex-wrap gap-1">
                    {tag.personas.map((persona, idx) => (
                      <span key={idx} className="b-persona-pill">{persona}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsTab;
