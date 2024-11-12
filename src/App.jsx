import React from 'react';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import SlyceInvoice from './components/SlyceInvoice';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SlyceInvoice />
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;