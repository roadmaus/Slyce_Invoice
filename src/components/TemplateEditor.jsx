import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, Copy, LayoutGrid, Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const TemplateEditor = ({ onClose }) => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState('');
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleData, setSampleData] = useState(null);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [originalTemplate, setOriginalTemplate] = useState('');
  const [isTemplateEdited, setIsTemplateEdited] = useState(false);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const content = await api.getInvoiceTemplate();
      if (content) {
        setTemplate(content);
        setPreview(content);
        setOriginalTemplate(content);
        setIsTemplateEdited(false);
      } else {
        setTemplate('');
        setPreview('');
        setOriginalTemplate('');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error(t('settings.errors.templateLoad'));
      setTemplate('');
      setPreview('');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentTemplates = async () => {
    try {
      const templates = await api.getRecentTemplates();
      setRecentTemplates(templates || []);
    } catch (error) {
      console.error('Error loading recent templates:', error);
      toast.error(t('settings.errors.templateGalleryLoad'));
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadTemplate();
        await loadSampleData();
        await loadRecentTemplates();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    init();
  }, []);

  const loadSampleData = async () => {
    try {
      // Load customers, business profiles, and tags
      const customers = await api.getData('customers') || [];
      const profiles = await api.getData('businessProfiles') || [];
      const tags = await api.getData('quickTags') || [];

      // Only set sample data if we have at least one of each
      if (customers.length > 0 && profiles.length > 0 && tags.length > 0) {
        setSampleData({
          customer: customers[0],
          profile: profiles[0],
          tag: tags[0]
        });
      }
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Only save as new template if content was edited
      await api.saveTemplate(template, !isTemplateEdited);
      toast.success(t('settings.success.templateSave'));
      await loadRecentTemplates();
      setOriginalTemplate(template);
      setIsTemplateEdited(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t('settings.errors.templateSave'));
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    if (confirm(t('settings.confirmations.resetTemplate'))) {
      setIsLoading(true);
      try {
        await api.resetTemplate();
        await loadTemplate();
        setEditingTemplate({ isDefault: true });
        toast.success(t('settings.success.templateReset'));
      } catch (error) {
        console.error('Error resetting template:', error);
        toast.error(t('settings.errors.templateReset'));
      }
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(template);
    toast.success(t('common.copied'));
  };

  const handleTemplateSelect = async (templatePath) => {
    setIsLoading(true);
    try {
      const content = await api.loadTemplateFromPath(templatePath);
      if (content) {
        setTemplate(content);
        setPreview(content);
        setOriginalTemplate(content);
        setIsTemplateEdited(false);
        toast.success(t('settings.success.templateLoad'));
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error(t('settings.errors.templateLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templatePath, event) => {
    event.stopPropagation();
    if (confirm(t('settings.confirmations.deleteTemplate'))) {
      try {
        await api.deleteTemplate(templatePath);
        toast.success(t('settings.success.templateDelete'));
        await loadRecentTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error(t('settings.errors.templateDelete'));
      }
    }
  };

  const handleRename = async (templatePath, event) => {
    event.stopPropagation();
    setEditingTemplate({ path: templatePath });
    setShowRenameDialog(true);
  };

  const submitRename = async () => {
    try {
      await api.renameTemplate(editingTemplate.path, newTemplateName);
      toast.success(t('settings.success.templateRename'));
      await loadRecentTemplates();
      setShowRenameDialog(false);
      setNewTemplateName('');
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error renaming template:', error);
      toast.error(t('settings.errors.templateRename'));
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <h2 className="text-lg font-medium">{t('settings.templateEditor')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGallery(!showGallery)}
          title={showGallery ? t('settings.actions.hideGallery') : t('settings.actions.showGallery')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          {t('settings.gallery')}
        </Button>
      </div>

      {showGallery && (
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('settings.recentTemplates')}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRecentTemplates}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('settings.actions.refresh')}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {recentTemplates.map((template, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer bg-background rounded-md border p-4 hover:border-primary transition-colors"
                  onClick={() => {
                    handleTemplateSelect(template.path);
                    setShowGallery(false);
                  }}
                >
                  <div className="aspect-[3/4] mb-2 bg-muted rounded-sm overflow-hidden">
                    {template.preview ? (
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                    
                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleRename(template.path, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDelete(template.path, e)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.modified}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="relative overflow-auto bg-muted rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleCopyToClipboard}
            title={t('common.copy')}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <textarea
            value={template}
            onChange={(e) => {
              const newContent = e.target.value;
              setTemplate(newContent);
              setPreview(newContent);
              setIsTemplateEdited(newContent !== originalTemplate);
            }}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-transparent text-foreground"
            spellCheck="false"
          />
        </div>
        <div className="bg-white rounded-md shadow-sm overflow-auto">
          <iframe
            srcDoc={preview}
            className="w-full h-full"
            title="Template Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
      <div className="border-t p-4 bg-background flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('settings.actions.reset')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {t('settings.actions.save')}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('settings.actions.close')}
          </Button>
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('settings.renameTemplate')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={t('settings.placeholders.templateName')}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={submitRename}>
                {t('common.rename')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TemplateEditor;
