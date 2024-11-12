import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Register the HTML language
SyntaxHighlighter.registerLanguage('html', html);

const TemplateEditor = ({ onClose }) => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState('');
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    loadTemplate();
    loadSampleData();
  }, []);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const content = await window.electronAPI.getInvoiceTemplate();
      setTemplate(content);
      setPreview(content);
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error(t('settings.errors.templateLoad'));
    }
    setIsLoading(false);
  };

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

  useEffect(() => {
    if (template && sampleData) {
      // Create preview with sample data
      const filledPreview = template
        .replaceAll('{company_name}', sampleData.profile.company_name)
        .replaceAll('{company_street}', sampleData.profile.company_street)
        .replaceAll('{company_postalcode}', sampleData.profile.company_postalcode)
        .replaceAll('{company_city}', sampleData.profile.company_city)
        .replaceAll('{tax_number}', sampleData.profile.tax_number || '')
        .replaceAll('{tax_id}', sampleData.profile.tax_id || '')
        .replaceAll('{customer_address}', `${sampleData.customer.title} ${sampleData.customer.name}\n${sampleData.customer.street}\n${sampleData.customer.postal_code} ${sampleData.customer.city}`)
        .replaceAll('{invoice_number_date}', `RE-2024-001 | ${new Date().toLocaleDateString()}`)
        .replaceAll('{greeting}', `Sehr geehrte(r) ${sampleData.customer.title} ${sampleData.customer.name},`)
        .replaceAll('{period}', new Date().toLocaleDateString())
        .replaceAll('{invoice_items}', `<tr><td>${sampleData.tag.description || sampleData.tag.name}</td><td>${sampleData.tag.quantity}</td><td>€${sampleData.tag.rate}</td><td>€${(sampleData.tag.quantity * sampleData.tag.rate).toFixed(2)}</td></tr>`)
        .replaceAll('{net_amount}', `€${(sampleData.tag.quantity * sampleData.tag.rate).toFixed(2)}`)
        .replaceAll('{vat_row}', sampleData.profile.vat_enabled ? `<tr><td colspan="3">MwSt. (${sampleData.profile.vat_rate}%)</td><td>€${((sampleData.tag.quantity * sampleData.tag.rate) * (sampleData.profile.vat_rate / 100)).toFixed(2)}</td></tr>` : '')
        .replaceAll('{vat_notice}', sampleData.profile.vat_enabled ? `Umsatzsteuer ${sampleData.profile.vat_rate}% gemäß § 27a UStG.` : 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.')
        .replaceAll('{total_amount}', `€${(sampleData.tag.quantity * sampleData.tag.rate * (1 + (sampleData.profile.vat_enabled ? sampleData.profile.vat_rate / 100 : 0))).toFixed(2)}`)
        .replaceAll('{bank_institute}', sampleData.profile.bank_institute || '')
        .replaceAll('{bank_iban}', sampleData.profile.bank_iban || '')
        .replaceAll('{bank_bic}', sampleData.profile.bank_bic || '')
        .replaceAll('{contact_details}', sampleData.profile.contact_details || '')
        .replaceAll('{quantity_label}', 'Menge')
        .replaceAll('{unit_price_label}', 'Einzelpreis');

      setPreview(filledPreview);
    } else {
      setPreview(template);
    }
  }, [template, sampleData]);

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

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      <div className="flex items-center p-4 border-b">
        <h2 className="text-lg font-medium">{t('settings.templateEditor')}</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="relative overflow-auto bg-muted rounded-md">
          <div className="relative">
            <textarea
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setPreview(e.target.value);
              }}
              className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent resize-none text-transparent caret-white"
              spellCheck="false"
            />
            <SyntaxHighlighter
              language="html"
              style={vs2015}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
              }}
            >
              {template}
            </SyntaxHighlighter>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm overflow-auto">
          <iframe
            srcDoc={preview}
            className="w-full h-full"
            title="Template Preview"
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
