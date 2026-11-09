import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CompanyProfileProvider } from './context/CompanyProfileContext';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CompanyProfileProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </CompanyProfileProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
