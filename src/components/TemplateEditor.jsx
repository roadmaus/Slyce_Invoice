import React, { useState, useEffect } from 'react';
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
        setTemplate(content); setPreview(content); setOriginalTemplate(content); setIsTemplateEdited(false);
      } else {
        setTemplate(''); setPreview(''); setOriginalTemplate('');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error(t('settings.errors.templateLoad'));
      setTemplate(''); setPreview('');
    } finally { setIsLoading(false); }
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
      await loadTemplate();
      await loadSampleData();
      await loadRecentTemplates();
    };
    init();
  }, []);

  const loadSampleData = async () => {
    try {
      const customers = await api.getData('customers') || [];
      const profiles = await api.getData('businessProfiles') || [];
      const tags = await api.getData('quickTags') || [];
      if (customers.length > 0 && profiles.length > 0 && tags.length > 0) {
        setSampleData({ customer: customers[0], profile: profiles[0], tag: tags[0] });
      }
    } catch (error) { console.error('Error loading sample data:', error); }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.saveTemplate(template, !isTemplateEdited);
      toast.success(t('settings.success.templateSave'));
      await loadRecentTemplates();
      setOriginalTemplate(template); setIsTemplateEdited(false);
    } catch (error) {
      toast.error(t('settings.errors.templateSave'));
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    if (confirm(t('settings.confirmations.resetTemplate'))) {
      setIsLoading(true);
      try {
        await api.resetTemplate(); await loadTemplate();
        setEditingTemplate({ isDefault: true });
        toast.success(t('settings.success.templateReset'));
      } catch (error) { toast.error(t('settings.errors.templateReset')); }
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
        setTemplate(content); setPreview(content); setOriginalTemplate(content); setIsTemplateEdited(false);
        toast.success(t('settings.success.templateLoad'));
      }
    } catch (error) { toast.error(t('settings.errors.templateLoad')); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (templatePath, event) => {
    event.stopPropagation();
    if (confirm(t('settings.confirmations.deleteTemplate'))) {
      try {
        await api.deleteTemplate(templatePath);
        toast.success(t('settings.success.templateDelete'));
        await loadRecentTemplates();
      } catch (error) { toast.error(t('settings.errors.templateDelete')); }
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
      setShowRenameDialog(false); setNewTemplateName(''); setEditingTemplate(null);
    } catch (error) { toast.error(t('settings.errors.templateRename')); }
  };

  return (
    <div className="b-editor">
      {/* Header */}
      <div className="b-editor-header">
        <span className="b-heading" style={{ fontSize: '0.85rem' }}>{t('settings.templateEditor')}</span>
        <button
          className="b-btn b-btn-outline"
          style={{ borderColor: 'hsl(var(--background) / 0.3)', color: 'hsl(var(--background))' }}
          onClick={() => setShowGallery(!showGallery)}
        >
          <LayoutGrid style={{ width: 14, height: 14 }} />
          {t('settings.gallery')}
        </button>
      </div>

      {/* Gallery Dialog */}
      {showGallery && (
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent style={{ maxWidth: '56rem' }}>
            <DialogHeader>
              <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>{t('settings.recentTemplates')}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-end mb-4 px-4">
              <button className="b-btn b-btn-ghost" onClick={loadRecentTemplates}>
                <RotateCcw style={{ width: 14, height: 14 }} />
                {t('settings.actions.refresh')}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 max-h-[60vh] overflow-y-auto px-4 pb-4">
              {recentTemplates.map((tmpl, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer border-2 border-transparent hover:border-foreground p-4 transition-colors"
                  onClick={() => { handleTemplateSelect(tmpl.path); setShowGallery(false); }}
                >
                  <div className="aspect-[3/4] mb-2 bg-muted overflow-hidden border border-foreground/10">
                    {tmpl.preview ? (
                      <img src={tmpl.preview} alt={tmpl.name} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="b-icon-btn" onClick={(e) => handleRename(tmpl.path, e)}>
                        <Pencil />
                      </button>
                      <button className="b-icon-btn b-icon-btn-destructive" onClick={(e) => handleDelete(tmpl.path, e)}>
                        <Trash />
                      </button>
                    </div>
                  </div>
                  <p className="b-mono text-sm truncate">{tmpl.name}</p>
                  <p className="b-mono text-xs text-muted-foreground">{tmpl.modified}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Editor body */}
      <div className="b-editor-body">
        <div className="b-editor-pane">
          <button
            className="b-icon-btn absolute top-2 right-2 z-10"
            onClick={handleCopyToClipboard}
            title={t('common.copy')}
          >
            <Copy />
          </button>
          <textarea
            value={template}
            onChange={(e) => {
              const newContent = e.target.value;
              setTemplate(newContent); setPreview(newContent);
              setIsTemplateEdited(newContent !== originalTemplate);
            }}
            className="b-editor-textarea"
            spellCheck="false"
          />
        </div>
        <div className="b-editor-pane" style={{ background: 'white' }}>
          <iframe
            srcDoc={preview}
            className="w-full h-full"
            title="Template Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="b-editor-footer">
        <button className="b-btn b-btn-outline" onClick={handleReset} disabled={isLoading}>
          <RotateCcw style={{ width: 14, height: 14 }} />
          {t('settings.actions.reset')}
        </button>
        <div className="flex gap-2">
          <button className="b-btn" onClick={handleSave} disabled={isLoading}>
            {isLoading
              ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
              : <Save style={{ width: 14, height: 14 }} />
            }
            {t('settings.actions.save')}
          </button>
          <button className="b-btn b-btn-outline" onClick={onClose}>
            {t('settings.actions.close')}
          </button>
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="b-heading" style={{ fontSize: '0.85rem' }}>{t('settings.renameTemplate')}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <Input
                className="brutalist-input"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={t('settings.placeholders.templateName')}
              />
            </div>
            <DialogFooter className="px-4 pb-4">
              <button className="b-btn b-btn-outline" onClick={() => setShowRenameDialog(false)}>
                {t('common.cancel')}
              </button>
              <button className="b-btn" onClick={submitRename}>
                {t('common.rename')}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TemplateEditor;
