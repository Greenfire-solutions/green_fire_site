import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Page } from './types';
import { ContentProvider } from './context/ContentContext';
import { ContactProvider } from './components/ContactProvider';
import { SiteLayout } from './components/layout/SiteLayout';
import { HomePage } from './pages/HomePage';
import { PackagesPage } from './pages/PackagesPage';
import { CinematicPage } from './pages/CinematicPage';
import { StudioPage } from './pages/StudioPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { UtahBoltPage } from './pages/UtahBoltPage';
import { ProgramPage } from './pages/ProgramPage';
import { ContactPage } from './pages/ContactPage';
import { AdminApp } from './admin/AdminApp';

function PublicSite() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
      case 'packages': return <PackagesPage onNavigate={setCurrentPage} />;
      case 'cinematic': return <CinematicPage onNavigate={setCurrentPage} />;
      case 'studio': return <StudioPage onNavigate={setCurrentPage} />;
      case 'workshops': return <WorkshopsPage onNavigate={setCurrentPage} />;
      case 'utah-bolt': return <UtahBoltPage onNavigate={setCurrentPage} />;
      case 'program': return <ProgramPage onNavigate={setCurrentPage} />;
      case 'contact': return <ContactPage />;
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ContentProvider>
      <ContactProvider onNavigateContact={() => setCurrentPage('contact')}>
        <SiteLayout currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </SiteLayout>
      </ContactProvider>
    </ContentProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
