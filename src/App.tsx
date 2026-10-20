import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import { ContactProvider } from './components/ContactProvider';
import { SiteLayout } from './components/layout/SiteLayout';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { OfferingsPage } from './pages/OfferingsPage';
import { OpenSourcePage } from './pages/OpenSourcePage';
import { GetInvolvedPage } from './pages/GetInvolvedPage';
import { PilotRoadmapPage } from './pages/PilotRoadmapPage';
import { PackagesPage } from './pages/PackagesPage';
import { CinematicPage } from './pages/CinematicPage';
import { StudioPage } from './pages/StudioPage';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { ContactPage } from './pages/ContactPage';
import { StartPage, StartThanksPage } from './pages/StartPage';
import { AdminApp } from './admin/AdminApp';

// The 3D scenes only download for visitors who actually open /tech.
const TechPage = lazy(() => import('./pages/TechPage').then((m) => ({ default: m.TechPage })));
import { ROUTES } from './lib/routes';

/* Only reached when the router, not the server, lands on /blog: a CMS link or
   a typed path inside the app. In production the real file is one load away;
   in `npm run dev` there is no file, because the blog is written by the build. */
function BlogFallback() {
  if (!import.meta.env.DEV) {
    window.location.replace(window.location.pathname + window.location.search + window.location.hash);
    return null;
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-stone-300">
      The blog is static HTML made by the build. Run <code>npm run build</code> then <code>npm run preview</code> to see it.
    </div>
  );
}

function PublicSite() {
  return (
    <ContentProvider>
      <ContactProvider>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/offerings" element={<OfferingsPage />} />
            <Route path="/offerings/packages" element={<PackagesPage />} />
            <Route path="/offerings/cinematic" element={<CinematicPage />} />
            <Route path="/offerings/studio" element={<StudioPage />} />
            <Route path="/offerings/workshops" element={<WorkshopsPage />} />
            <Route
              path="/tech"
              element={
                <Suspense fallback={<div className="min-h-[70vh]" />}>
                  <TechPage />
                </Suspense>
              }
            />
            <Route path="/open-source" element={<OpenSourcePage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/pilot-roadmap" element={<PilotRoadmapPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/start" element={<StartPage />} />
            <Route path="/start/thanks" element={<StartThanksPage />} />
            <Route path="/ai" element={<Navigate to="/start" replace />} />
            <Route path="/blog/*" element={<BlogFallback />} />

            {/* Legacy redirects */}
            <Route path="/packages" element={<Navigate to={ROUTES.offeringsPackages} replace />} />
            <Route path="/cinematic" element={<Navigate to={ROUTES.offeringsCinematic} replace />} />
            <Route path="/studio" element={<Navigate to={ROUTES.offeringsStudio} replace />} />
            <Route path="/workshops" element={<Navigate to={ROUTES.offeringsWorkshops} replace />} />
            <Route path="/offerings/utah-bolt" element={<Navigate to={ROUTES.offeringsCinematic} replace />} />
            <Route path="/utah-bolt" element={<Navigate to={ROUTES.offeringsCinematic} replace />} />
            <Route path="/program" element={<Navigate to={ROUTES.howItWorks} replace />} />
          </Routes>
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
