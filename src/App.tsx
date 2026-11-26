import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { Layout } from './components/layout/Layout';

const HomePage = lazy(() =>
  import('./pages/HomePage').then((mod) => ({ default: mod.HomePage }))
);
const GamesLibraryPage = lazy(() =>
  import('./pages/GamesLibraryPage').then((mod) => ({ default: mod.GamesLibraryPage }))
);
const GamePage = lazy(() =>
  import('./pages/GamePage').then((mod) => ({ default: mod.GamePage }))
);
const SevensTutorialPage = lazy(() =>
  import('./pages/SevensTutorialPage').then((mod) => ({
    default: mod.SevensTutorialPage,
  }))
);
const SevensPlayPage = lazy(() =>
  import('./pages/SevensPlayPage').then((mod) => ({
    default: mod.SevensPlayPage,
  }))
);
const PorridgePlayPage = lazy(() =>
  import('./pages/PorridgePlayPage').then((mod) => ({
    default: mod.PorridgePlayPage,
  }))
);
const RedOrBlackPlayPage = lazy(() =>
  import('./pages/RedOrBlackPlayPage').then((mod) => ({
    default: mod.RedOrBlackPlayPage,
  }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((mod) => ({ default: mod.AboutPage }))
);
const ContributePage = lazy(() =>
  import('./pages/ContributePage').then((mod) => ({ default: mod.ContributePage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((mod) => ({ default: mod.NotFoundPage }))
);

function RouteLoadingFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-[#6B6059] sm:px-6 lg:px-8">
      Loading archive page...
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesLibraryPage />} />
              <Route path="/games/sevens/learn" element={<SevensTutorialPage />} />
              <Route path="/games/sevens/play" element={<SevensPlayPage />} />
              <Route path="/games/porridge/play" element={<PorridgePlayPage />} />
              <Route path="/games/red-or-black/play" element={<RedOrBlackPlayPage />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contribute" element={<ContributePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
