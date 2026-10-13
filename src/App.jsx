import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import CaseStudyPage from './pages/CaseStudyPage';
import ShowcasePage from './pages/ShowcasePage';
import ScrollHandler from './components/ScrollHandler';

const AdminPage = lazy(() => import('./pages/AdminPage'));
import SwissHeader from './components/layout/SwissHeader';
import PixelCursor from './components/ui/PixelCursor';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAF9F6] transition-colors duration-200 relative">
      {!isAdmin && <SwissHeader />}
      <div className={`flex-grow ${isAdmin ? '' : 'pt-[52px]'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<CaseStudyPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/motion" element={<Navigate to="/showcase" replace />} />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<div className="min-h-screen bg-[#fbfbfa] dark:bg-[#0A0A0A] flex items-center justify-center font-mono text-xs uppercase text-[#0A0A0A] dark:text-[#FAF9F6]">INITIALIZING STUDIO ACCESS...</div>}>
                <AdminPage />
              </Suspense>
            } 
          />
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
