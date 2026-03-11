
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import Footer from '../components/Footer'; 

import {
  Container
} from '../styles/pages/HomeStyles';

const Home = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <Container theme={theme}>
      <Header 
        darkMode={isDarkMode}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      <HeroSection theme={theme} />
      <FeaturesSection theme={theme} />
      
      <Footer theme={theme} />
    </Container>
  );
};

export default Home;