import React, { useEffect, useState } from 'react';
import AuthTabs from '../components/Auth/AuthTabs';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import FeatureCard from '../components/FeatureCard';
import ScrollDown from '../components/ScrollDown';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('fade-in');
        }
      });
    }, { threshold: 0.1 });
    
    featureCards.forEach(card => {
      observer.observe(card);
    });
    
    return () => {
      featureCards.forEach(card => {
        observer.unobserve(card);
      });
    };
  }, []);

  const features = [
    {
      icon: 'laptop',
      title: 'Showcase Your Work',
      description: 'Upload your projects, get feedback from other developers, and build a portfolio that stands out to potential employers.'
    },
    {
      icon: 'users',
      title: 'Connect with Peers',
      description: 'Find developers with similar interests, collaborate on projects, and grow your professional network.'
    },
    {
      icon: 'rocket',
      title: 'Discover Opportunities',
      description: 'Get matched with job opportunities, freelance gigs, and open-source projects that fit your skills.'
    }
  ];

  return (
    <div>
      
      {/* Hero Section */}
      <div className="hero">
        <div className="code-bg"></div>
        <h1 className="logo">View Doc</h1>
        <p className="tagline">
          Connect, collaborate, and grow with developers around the world. 
          Share projects, get feedback, and find your next opportunity.
        </p>

      <div className="auth-container scale-in">
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'login' ? (
  <LoginForm 
    switchToRegister={() => setActiveTab('register')} 
  />
) : (
  <RegisterForm 
    switchToLogin={() => setActiveTab('login')} 
  />
)}
      </div>
        
        <ScrollDown onClick={scrollToFeatures} />
      </div>
      
      {/* Features Section */}
      <section className="features container">
        <h2 className="section-title text-center">Why Join View Doc?</h2>
        <div className="features-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta">
        <div className="container text-center">
          <h2 className="cta-title">Ready to join our developer community?</h2>
          <p className="cta-desc">
            Sign up now and start connecting with thousands of developers worldwide.<br></br>
            It's free and always will be.
          </p>
          <button 
            className="cta-btn" 
            onClick={() => setActiveTab('register')}
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default Splash;