import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InvoicePreviewDialog = ({ preview, onAccept, onReject }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onReject();
      }}
    >
      <DialogContent className="pdf-preview-content z-[99]">
        <div className="shrink-0 px-4 pt-4 pb-2">
          <DialogHeader>
            <DialogTitle>
              {t('invoice.actions.preview')} — {preview.fileName}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="pdf-container">
          <iframe
            src={preview.blobUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', display: 'block' }}
            title="PDF Preview"
          />
        </div>
        <div className="shrink-0 flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onReject}
            className="brutalist-generate-btn"
            style={{ background: 'var(--destructive)', maxWidth: '160px' }}
          >
            <X className="h-4 w-4" />
            <span>{t('invoice.actions.reject')}</span>
          </button>
          <button
            onClick={onAccept}
            className="brutalist-generate-btn"
            style={{ maxWidth: '160px' }}
          >
            <Check className="h-4 w-4" />
            <span>{t('invoice.actions.accept')}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
