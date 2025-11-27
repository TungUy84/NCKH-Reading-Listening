import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { LearningPath } from './components/LearningPath';
import { TestSections } from './components/TestSections';
import { BlogPreview } from './components/BlogPreview';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <TestSections />
      <LearningPath />
      <BlogPreview />
      <Footer />
    </div>
  );
}
