import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
        <img
          src="/images/The Ron Logo.png" // Assumes /public is served at the root
          alt="The Ron Logo"
          className="mb-4 h-12 w-auto" // Adjusted height and added bottom margin
        />
        {/* You can add other footer content here, like copyright text or links */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 