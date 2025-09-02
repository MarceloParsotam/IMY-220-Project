import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
const PossibleConnections = () => {
  const connections = [
    { name: 'David Cool' },
    { name: 'Jessica Amber' }
  ];

  return (
    <div className="possible-connections">
      <h3 className="section-title">Possible Connections</h3>
      <div className="connections-list">
        {connections.map((connection, index) => (
          <div key={index} className="connection-item">
            <FaUserCircle size={28} />
            <span className="connection-name">{connection.name}</span>
            <button className="connect-btn">connect</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PossibleConnections;