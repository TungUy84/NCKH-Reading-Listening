import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import TestSections from '../components/TestSections';
import LearningPath from '../components/LearningPath';
import BlogPreview from '../components/BlogPreview';

// Trang chủ ghép các section chính của landing page
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestSections />
      <LearningPath />
      <BlogPreview />
    </div>
  );
};

export default HomePage;
