import React from 'react';
import { Box } from '@chakra-ui/react';
import HeroSection from '../components/Sections/HeroSection';
import FeaturesSection from '../components/Sections/FeaturesSection';
import AboutSection from '../components/Sections/AboutSection';

const HomePage = () => {
  return (
    <Box>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
    </Box>
  );
};

export default HomePage;
