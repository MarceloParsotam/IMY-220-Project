import React from 'react';
import { FaLaptopCode, FaUsers, FaRocket } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description }) => {
  const renderIcon = () => {
    switch(icon) {
      case 'laptop':
        return <FaLaptopCode className="feature-icon" />;
      case 'users':
        return <FaUsers className="feature-icon" />;
      case 'rocket':
        return <FaRocket className="feature-icon" />;
      default:
        return <div className="feature-icon">{icon}</div>;
    }
  };

  return (
    <div className="feature-card">
      {renderIcon()}
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
};

export default FeatureCard;