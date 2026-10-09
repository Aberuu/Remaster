import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import CaseStudyPage from './pages/CaseStudyPage';
import AdminPage from './pages/AdminPage';
import ScrollHandler from './components/ScrollHandler';
import SwissHeader from './components/layout/SwissHeader';
import PixelCursor from './components/ui/PixelCursor';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-[#0A0A0A] transition-colors duration-200 relative">
      {!isAdmin && <SwissHeader />}
      <div className={`flex-grow ${isAdmin ? '' : 'pt-[52px]'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<CaseStudyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Analytics />
        <PixelCursor />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
