import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const TemplateEditor = ({ onClose }) => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState('');
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleData, setSampleData] = useState(null);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const content = await window.electronAPI.getInvoiceTemplate();
      if (content) {
        setTemplate(content);
        setPreview(content);
      } else {
        setTemplate('');
        setPreview('');
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

  useEffect(() => {
    const init = async () => {
      try {
        await loadTemplate();
        await loadSampleData();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    init();
  }, []);

  const loadSampleData = async () => {
    try {
      // Load customers, business profiles, and tags
      const customers = await window.electronAPI.getData('customers') || [];
      const profiles = await window.electronAPI.getData('businessProfiles') || [];
      const tags = await window.electronAPI.getData('quickTags') || [];

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
      await window.electronAPI.saveTemplate(template);
      toast.success(t('settings.success.templateSave'));
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
        await window.electronAPI.resetTemplate();
        await loadTemplate();
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

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      <div className="flex items-center p-4 border-b">
        <h2 className="text-lg font-medium">{t('settings.templateEditor')}</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="relative overflow-auto bg-muted rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleCopyToClipboard}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <textarea
            value={template}
            onChange={(e) => {
              setTemplate(e.target.value);
              setPreview(e.target.value);
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
      <div className="border-t p-4 bg-background flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('settings.actions.reset')}
        </Button>
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
  );
};

export default TemplateEditor;
