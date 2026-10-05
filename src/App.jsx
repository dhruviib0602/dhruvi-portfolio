import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Cursor from './components/Cursor';
import Landing from './pages/Landing';
import About from './pages/About';
import Work from './pages/Work';
import InclusiveNavigation from './pages/InclusiveNavigation';
import HowToBeHuman from './pages/HowToBeHuman';
import KakoriKaand from './pages/KakoriKaand';
import ThelaThailaThikana from './pages/ThelaThailaThikana';
import Mori from './pages/Mori';
import AlignR from './pages/AlignR';

// Loaded only when visited, so the 3D library doesn't slow down other pages.
const Playground = lazy(() => import('./pages/Playground'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Cursor />
      <Suspense fallback={<div className="page" style={{ minHeight: '100vh' }} />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/inclusive-navigation" element={<InclusiveNavigation />} />
        <Route path="/work/how-to-be-human" element={<HowToBeHuman />} />
        <Route path="/work/kakori-kaand" element={<KakoriKaand />} />
        <Route path="/work/thela-thaila-thikana" element={<ThelaThailaThikana />} />
        <Route path="/work/mori" element={<Mori />} />
        <Route path="/work/alignr" element={<AlignR />} />
        <Route path="/archive" element={<Playground />} />
        <Route path="/playground" element={<Navigate to="/archive" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}
