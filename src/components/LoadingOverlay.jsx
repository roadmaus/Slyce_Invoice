import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
  const { t, i18n } = useTranslation(null, { useSuspense: false });
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span>{t('common.loading')}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay; 