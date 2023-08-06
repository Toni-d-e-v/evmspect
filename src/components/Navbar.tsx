// Navbar.tsx

import React from 'react';

interface NavbarProps {
  // Add any props you want to pass to the navbar component
}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav>
      <ul>
        <li>
        <h1>EVMSpect</h1>
        </li>
        <li>
        <p>EVMSpect is an open source tool to visualize Ethereum transactions and their relationships.</p>
        </li>
        <li>
            <p>
                Project by <a href="https://github.com/toni-d-e-v" target="_blank" rel="noopener noreferrer">Toni Dumancic </a>
            </p>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
