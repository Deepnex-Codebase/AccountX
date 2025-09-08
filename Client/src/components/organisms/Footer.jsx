import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 text-sm mb-2 md:mb-0">
          © {currentYear} AccountX. All rights reserved.
        </div>
        <div className="text-gray-600 text-sm flex items-center">
          Powered by <a href="https://deepnex.in" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 ml-1 hover:underline">Deepnex Technologies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;