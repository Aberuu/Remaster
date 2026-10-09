import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import CaseStudyPage from './pages/CaseStudyPage';
import ScrollHandler from './components/ScrollHandler';
import SwissHeader from './components/layout/SwissHeader';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Analytics />
        <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-[#0A0A0A] transition-colors duration-200 relative">
          <SwissHeader />
          <div className="flex-grow pt-[52px]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:id" element={<CaseStudyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
