import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Grain from './components/Grain';
import Boot from './components/Boot';
import Readout from './components/Readout';
import CommandPalette from './components/CommandPalette';
import Hero from './components/Hero';
import LogTicker from './components/LogTicker';
import Dossier from './components/Dossier';
import Checkpoints from './components/Checkpoints';
import Ablations from './components/Ablations';
import Weights from './components/Weights';
import FieldNotes from './components/FieldNotes';
import Deploy from './components/Deploy';
import { setLenis } from './lib/scroll';
import { useRunProgress } from './hooks/useRunProgress';

function App() {
  // Dark lab is the default (mirrors the FOUC guard in index.html).
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') !== 'false',
  );
  const run = useRunProgress();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    setLenis(lenis);
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-paper font-sans text-ink antialiased dark:bg-ink dark:text-paper">
      <Analytics />
      <Grain />
      <Boot />
      <Readout run={run} />
      <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode((v) => !v)} />
      <CommandPalette />
      <main>
        <Hero run={run} />
        <LogTicker />
        <Dossier />
        <Checkpoints />
        <Ablations />
        <Weights />
        <FieldNotes />
        <Deploy />
      </main>
    </div>
  );
}

export default App;
