import React from 'react';
import { ThemeProvider } from 'next-themes';
import SlyceInvoice from './components/SlyceInvoice';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SlyceInvoice />
    </ThemeProvider>
  );
}

export default App;