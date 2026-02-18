import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingOverlay = () => {
  const { t } = useTranslation(null, { useSuspense: false });

  return (
    <div className="b-loading">
      <div className="b-loading-inner">
        <div className="b-loading-bar" />
        <span className="b-loading-text">{t('common.loading')}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
