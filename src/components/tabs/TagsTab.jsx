import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/constants/currencies';

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

  // Load currency settings on mount
  React.useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await window.electronAPI.getData('currency');
        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
        }
      } catch (error) {
        console.error('Error loading currency settings:', error);
      }
    };
    loadCurrency();
  }, []);

  // Listen for currency changes
  React.useEffect(() => {
    const handleCurrencyChange = (event) => {
      setSelectedCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  return (
    <Card>
      <CardContent className="responsive-p">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-foreground">{t('tags.title')}</h2>
          <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('tags.actions.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {newTag.name ? t('tags.dialog.editTitle') : t('tags.dialog.addTitle')}
                </DialogTitle>
                <DialogDescription>
                  {newTag.name ? t('tags.dialog.editDescription') : t('tags.dialog.addDescription')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="dialog-section">
                <div className="form-field">
                  <Label>{t('tags.form.name')}</Label>
                  <Input
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <Label>{t('tags.form.description')}</Label>
                  <Input
                    value={newTag.description}
                    onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-field">
                    <Label>{t('tags.form.rate')}</Label>
                    <Input
                      type="number"
                      value={newTag.rate}
                      onChange={(e) => setNewTag({ ...newTag, rate: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-field">
                    <Label>{t('tags.form.quantity')}</Label>
                    <Input
                      type="number"
                      value={newTag.quantity}
                      onChange={(e) => setNewTag({ ...newTag, quantity: e.target.value })}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>{t('tags.form.color')}</Label>
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
                  <Label>{t('tags.form.visible')}</Label>
                </div>

                <div className="switch-container">
                  <Switch
                    checked={newTag.hasDateRange}
                    onCheckedChange={(checked) => setNewTag({ ...newTag, hasDateRange: checked })}
                  />
                  <Label>{t('tags.form.usesDateRange')}</Label>
                </div>

                <div className="form-field">
                  <Label>{t('tags.form.personas')}</Label>
                  <ReactSelect
                    isMulti
                    options={businessProfiles.map((profile) => ({
                      value: profile.company_name,
                      label: profile.company_name,
                    }))}
                    value={newTag.personas.map((persona) => ({
                      value: persona,
                      label: persona,
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
                    styles={{
                      input: (base) => ({
                        ...base,
                        color: 'inherit'
                      })
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewTag({
                      name: '',
                      description: '',
                      rate: '',
                      quantity: '',
                      color: PREDEFINED_COLORS[0].value,
                      hasDateRange: true,
                      visible: true,
                      personas: [],
                    });
                    setShowNewTagDialog(false);
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => {
                  if (newTag.name && quickTags.find(t => t.name === newTag.name)) {
                    // Handle edit case
                    const updatedTags = quickTags.map(t => 
                      t.name === newTag.name ? newTag : t
                    );
                    setQuickTags(updatedTags);
                  } else {
                    // Handle add case
                    addQuickTag();
                  }
                  // Clear the state after saving
                  setNewTag({
                    name: '',
                    description: '',
                    rate: '',
                    quantity: '',
                    color: PREDEFINED_COLORS[0].value,
                    hasDateRange: true,
                    visible: true,
                    personas: [],
                  });
                  setShowNewTagDialog(false);
                }}>
                  {newTag.name ? t('common.save') : t('tags.actions.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tags Grid */}
        <div className="responsive-grid responsive-gap">
          {quickTags.map((tag, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border/50 hover:border-border 
                transition-all duration-200 hover:shadow-lg"
              style={{ 
                background: getTagBackground(tag.color || '#f3f4f6', isDarkMode)
              }}
            >
              {/* Quick Actions - Simplified opacity transition */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 
                group-hover:opacity-100 transition-opacity duration-200 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/90 hover:bg-background"
                  onClick={() => handleTagDialog(tag)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/90 hover:bg-background"
                  onClick={() => {
                    const updatedTags = quickTags.filter((_, i) => i !== index);
                    setQuickTags(updatedTags);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Visibility Toggle */}
              <div className="absolute top-4 left-4 z-20">
                <Switch
                  checked={tag.visible}
                  onCheckedChange={(checked) => {
                    const updatedTags = [...quickTags];
                    updatedTags[index].visible = checked;
                    setQuickTags(updatedTags);
                  }}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <CardContent className="p-6 mt-8">
                {/* Tag Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color || '#e2e8f0' }} 
                    />
                    <h3 className="font-semibold text-lg text-foreground/90 truncate">
                      {tag.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {tag.description || t('tags.form.noDescription')}
                  </p>
                </div>

                {/* Tag Details - Simplified backgrounds */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <span className="text-sm text-foreground/70">{t('tags.form.rate')}:</span>
                    <span className="font-medium text-foreground">
                      {selectedCurrency.symbol}{parseFloat(tag.rate).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                    <span className="text-sm text-foreground/70">{t('tags.form.quantity')}:</span>
                    <span className="font-medium text-foreground">{tag.quantity}</span>
                  </div>
                  {tag.hasDateRange && (
                    <div className="flex items-center justify-center p-1.5 rounded-md bg-background/50">
                      <span className="text-xs text-foreground/70">{t('tags.form.usesDateRange')}</span>
                    </div>
                  )}
                </div>

                {/* Associated Personas - Simplified backgrounds */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground/70">{t('tags.form.personas')}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tag.personas?.map((persona, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                          font-medium bg-background/50 text-foreground/80 border border-border/50"
                      >
                        {persona}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {quickTags.length === 0 && (
            <div className="col-span-full text-center py-12 bg-secondary/50 rounded-lg 
              border-2 border-dashed border-border">
              <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('tags.emptyState.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('tags.emptyState.description')}
              </p>
              <Button 
                onClick={() => setShowNewTagDialog(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t('tags.emptyState.addFirst')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagsTab;
