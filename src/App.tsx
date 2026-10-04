import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Grain from './components/Grain';
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [darkMode, setDarkMode] = useState(false);
  // Use Analytics for tracking

  <Analytics />
  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else if (prefersDark) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <Grain />
      <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Blog />
        <Contact />
      </main>
    </div>
  );
}

export default App;
