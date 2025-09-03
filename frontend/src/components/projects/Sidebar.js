import React from 'react';

const Sidebar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="sidebar">
      <h2>My Projects</h2>
      <ul>
        {categories.map(category => (
          <li 
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;