import React from 'react';
import HeroSection from '../components/HeroSection';
import PlacementSection from '../components/PlacementSection';
import LearningPath from '../components/LearningPath';
import PracticeSection from '../components/PracticeSection';
import LessonSection from '../components/LessonSection';
import MockTestSection from '../components/MockTestSection';
import BlogPreview from '../components/BlogPreview';

// Trang chủ ghép các section chính của landing page
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PlacementSection />
      <LearningPath />
      <PracticeSection />
      <LessonSection />
      <MockTestSection />
      <BlogPreview />
    </div>
  );
};

export default HomePage;
