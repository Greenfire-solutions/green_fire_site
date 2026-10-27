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
import { InvestPage } from './pages/InvestPage';
import { AdminApp } from './admin/AdminApp';

// The 3D scenes only download for visitors who actually open /tech.
const TechPage = lazy(() => import('./pages/TechPage').then((m) => ({ default: m.TechPage })));
// The 3D store downloads three.js only for visitors who open /store.
const StorePage = lazy(() => import('./pages/StorePage').then((m) => ({ default: m.StorePage })));
// Where a store checkout lands: the downloads, checked against Stripe.
const StoreAccountPage = lazy(() => import('./pages/StoreAccountPage').then((m) => ({ default: m.StoreAccountPage })));
import { ROUTES } from './lib/routes';

/* Only reached when the app, not a blog file, is showing a /blog address.
   Two ways that happens: a router link inside the app (then the real file is
   one full load away), or a post that does not exist, which the server answers
   with the app. The second must NOT reload, or it reloads forever: a page that
   was loaded fresh at this very address is a missing post, so it says so. */
function BlogFallback() {
  const loadedHere = (() => {
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return !nav || new URL(nav.name).pathname === window.location.pathname;
    } catch { return true; }
  })();
  if (!import.meta.env.DEV && !loadedHere) {
    window.location.replace(window.location.pathname + window.location.search + window.location.hash);
    return null;
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-stone-300">
      <h1 className="text-3xl font-semibold text-white">That post is not here</h1>
      <p className="mt-4">It may have moved. <a href="/blog/" className="text-emerald-400 underline">See every post on the blog</a>.</p>
      {import.meta.env.DEV && <p className="mt-4 text-sm text-stone-500">In npm run dev the blog does not exist: it is written by the build. Run npm run build then npm run preview.</p>}
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
            <Route
              path="/store"
              element={
                <Suspense fallback={<div className="min-h-[70vh] bg-[#04110f]" />}>
                  <StorePage />
                </Suspense>
              }
            />
            <Route
              path="/store/account"
              element={
                <Suspense fallback={<div className="min-h-[70vh] bg-[#04110f]" />}>
                  <StoreAccountPage />
                </Suspense>
              }
            />
            <Route path="/open-source" element={<OpenSourcePage />} />
            <Route path="/get-involved" element={<GetInvolvedPage />} />
            <Route path="/pilot-roadmap" element={<PilotRoadmapPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/start" element={<StartPage />} />
            <Route path="/invest" element={<InvestPage />} />
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
